import "server-only";

import { getGoogleAccessToken } from "@/lib/google-auth";
import { partsInZone, zonedToUtc } from "@/lib/timezone";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

/**
 * Regras de agendamento — único lugar a mexer.
 *
 * MODELO: disponibilidade DECLARADA, não inferida.
 * Os horários oferecidos saem da agenda "Office hours", menos o que estiver
 * ocupado na agenda principal. Procurar frestas numa agenda cheia oferece
 * justamente os buracos entre compromissos — e empilha reunião sobre reunião.
 */
export const bookingConfig = {
  /** Agenda onde os eventos são criados e de onde vem o "ocupado". */
  calendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
  /** Agenda cujos eventos representam JANELAS ABERTAS para intro calls. */
  availabilityCalendarId: process.env.GOOGLE_AVAILABILITY_CALENDAR_ID ?? "",

  hostTimeZone: "America/Sao_Paulo",
  durationMinutes: 45,
  bufferMinutes: 15,
  /** Granularidade dos horários candidatos. 30 dá horas "redondas". */
  stepMinutes: 30,
  minNoticeHours: 24,
  maxDaysAhead: 21,
  /** Horários exibidos por dia, distribuídos ao longo da janela. */
  maxSlotsShownPerDay: 4,

  /** Fallback quando não há agenda de disponibilidade configurada. */
  fallbackWorkingDays: [1, 2, 3, 4, 5],
  fallbackStartHour: 9,
  fallbackEndHour: 18,
} as const;

export type Slot = { start: string; end: string };
type Range = { start: number; end: number };

export type SlotDebug = {
  source: "availability-calendar" | "fallback-working-hours";
  windows: number;
  busyBlocks: number;
  rejectedNotice: number;
  rejectedBusy: number;
  rejectedDayCap: number;
  produced: number;
};

async function api(path: string, init?: RequestInit) {
  const token = await getGoogleAccessToken(CALENDAR_SCOPE);
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchBusy(from: number, to: number): Promise<Range[]> {
  const data = await api("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: new Date(from).toISOString(),
      timeMax: new Date(to).toISOString(),
      items: [{ id: bookingConfig.calendarId }],
    }),
  });
  const busy = data?.calendars?.[bookingConfig.calendarId]?.busy ?? [];
  return busy.map((b: { start: string; end: string }) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
}

/** Janelas abertas, vindas da agenda de disponibilidade. */
async function fetchWindows(from: number, to: number): Promise<Range[]> {
  const id = bookingConfig.availabilityCalendarId;
  if (!id) return [];

  const params = new URLSearchParams({
    timeMin: new Date(from).toISOString(),
    timeMax: new Date(to).toISOString(),
    singleEvents: "true", // expande recorrências
    orderBy: "startTime",
    maxResults: "250",
  });

  const data = await api(`/calendars/${encodeURIComponent(id)}/events?${params}`);
  type Ev = { start?: { dateTime?: string }; end?: { dateTime?: string }; status?: string };

  return (data.items ?? [])
    .filter((e: Ev) => e.status !== "cancelled" && e.start?.dateTime && e.end?.dateTime)
    .map((e: Ev) => ({
      start: new Date(e.start!.dateTime!).getTime(),
      end: new Date(e.end!.dateTime!).getTime(),
    }));
}

/** Janelas sintéticas de horário comercial, quando não há agenda dedicada. */
function fallbackWindows(from: number, to: number): Range[] {
  const c = bookingConfig;
  const windows: Range[] = [];

  for (let offset = 0; offset <= c.maxDaysAhead; offset++) {
    const day = partsInZone(from + offset * 86_400_000, c.hostTimeZone);
    const weekday = new Date(
      zonedToUtc(day.year, day.month, day.day, 12, 0, c.hostTimeZone),
    ).getUTCDay();

    if (!(c.fallbackWorkingDays as readonly number[]).includes(weekday)) continue;

    windows.push({
      start: zonedToUtc(day.year, day.month, day.day, c.fallbackStartHour, 0, c.hostTimeZone),
      end: zonedToUtc(day.year, day.month, day.day, c.fallbackEndHour, 0, c.hostTimeZone),
    });
  }
  return windows.filter((w) => w.end > from && w.start < to);
}

export async function getAvailableSlots(debug?: { out: SlotDebug }): Promise<Slot[]> {
  const c = bookingConfig;
  const now = Date.now();
  const earliest = now + c.minNoticeHours * 3600_000;
  const horizon = now + c.maxDaysAhead * 86_400_000;

  const [rawWindows, busy] = await Promise.all([
    fetchWindows(now, horizon),
    fetchBusy(now, horizon),
  ]);

  const usingCalendar = c.availabilityCalendarId !== "" && rawWindows.length > 0;
  const windows = usingCalendar ? rawWindows : fallbackWindows(now, horizon);

  const slotMs = c.durationMinutes * 60_000;
  const stepMs = c.stepMinutes * 60_000;
  const bufferMs = c.bufferMinutes * 60_000;

  const d: SlotDebug = {
    source: usingCalendar ? "availability-calendar" : "fallback-working-hours",
    windows: windows.length,
    busyBlocks: busy.length,
    rejectedNotice: 0,
    rejectedBusy: 0,
    rejectedDayCap: 0,
    produced: 0,
  };

  // 1. Todos os candidatos válidos, agrupados por dia.
  const byDay = new Map<string, number[]>();

  for (const window of windows) {
    // Alinha na grade de `stepMinutes` para não gerar 14:07.
    const first = Math.ceil(window.start / stepMs) * stepMs;

    for (let start = first; start + slotMs <= window.end; start += stepMs) {
      const end = start + slotMs;

      if (start < earliest || end > horizon) {
        d.rejectedNotice++;
        continue;
      }

      const collides = busy.some((b) => start < b.end + bufferMs && end + bufferMs > b.start);
      if (collides) {
        d.rejectedBusy++;
        continue;
      }

      const dayKey = partsInZone(start, c.hostTimeZone).isoDate;
      const list = byDay.get(dayKey) ?? [];
      list.push(start);
      byDay.set(dayKey, list);
    }
  }

  /**
   * 2. Amostragem UNIFORME ao longo do dia.
   *
   * Cortar pelos primeiros N entrega 09:00, 09:30, 10:00, 10:30 — quatro
   * opções que são, na prática, a mesma. Distribuir pega manhã, meio e fim
   * de tarde, o que é escolha de verdade e ainda protege o meio do dia.
   */
  const slots: Slot[] = [];
  const cap = c.maxSlotsShownPerDay;

  for (const candidates of byDay.values()) {
    candidates.sort((a, b) => a - b);

    const chosen =
      candidates.length <= cap
        ? candidates
        : Array.from({ length: cap }, (_, i) =>
            candidates[Math.round((i * (candidates.length - 1)) / (cap - 1))],
          );

    d.rejectedDayCap += candidates.length - chosen.length;

    for (const start of chosen) {
      d.produced++;
      slots.push({
        start: new Date(start).toISOString(),
        end: new Date(start + slotMs).toISOString(),
      });
    }
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  if (debug) debug.out = d;
  return slots;
}

/** Cria o evento e convida a pessoa. Remarcar e cancelar ficam por conta do convite do Google. */
export async function createBooking(input: {
  startIso: string;
  name: string;
  email: string;
  company?: string;
  notes?: string;
  visitorTimeZone?: string;
}): Promise<{ htmlLink?: string; meetLink?: string }> {
  const start = new Date(input.startIso);
  const end = new Date(start.getTime() + bookingConfig.durationMinutes * 60_000);

  const description = [
    "Booked from caaju.com.br",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.company ? `Company: ${input.company}` : null,
    input.visitorTimeZone ? `Timezone: ${input.visitorTimeZone}` : null,
    input.notes ? `\nNotes:\n${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const base = {
    summary: `Intro call — ${input.name}${input.company ? ` (${input.company})` : ""}`,
    description,
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    attendees: [{ email: input.email, displayName: input.name }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  const path = `/calendars/${encodeURIComponent(bookingConfig.calendarId)}/events`;

  try {
    const created = await api(`${path}?conferenceDataVersion=1&sendUpdates=all`, {
      method: "POST",
      body: JSON.stringify({
        ...base,
        conferenceData: {
          createRequest: {
            requestId: `caaju-${start.getTime()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    });
    return {
      htmlLink: created.htmlLink,
      meetLink: created.hangoutLink ?? created.conferenceData?.entryPoints?.[0]?.uri,
    };
  } catch (error) {
    // Criar sala do Meet pode ser barrado por política. Melhor agendar sem
    // link do que perder o agendamento.
    console.warn("[booking] Meet indisponível, criando sem conferência:", error);
    const created = await api(`${path}?sendUpdates=all`, {
      method: "POST",
      body: JSON.stringify(base),
    });
    return { htmlLink: created.htmlLink };
  }
}
