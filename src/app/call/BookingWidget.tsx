"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Slot = { start: string; end: string };
type Step = "loading" | "picking" | "details" | "sending" | "done" | "error";

const field =
  "w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-text " +
  "placeholder:text-subtle focus:border-primary/60 focus:outline-none";

function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous week" : "Next week"}
      className={cn(
        "grid size-8 place-items-center rounded-full border transition-all duration-200",
        disabled
          // Controle desabilitado é isento da regra de contraste do WCAG.
          // Baixo contraste aqui é sinal, não descuido.
          ? "cursor-default border-border/40 text-muted/25"
          : "border-border text-muted hover:border-primary/50 hover:bg-primary/10 hover:text-text active:scale-90",
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
        <path
          d={direction === "prev" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function BookingWidget() {
  const [step, setStep] = useState<Step>("loading");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ meetLink?: string } | null>(null);
  const [duration, setDuration] = useState(45);

  const stripRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  /** Habilita/desabilita as setas conforme a posição do scroll. */
  const syncEdges = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
  }, []);

  /** Avança/volta uma semana útil — 5 cartões, não uma tela arbitrária. */
  const scrollWeek = useCallback((direction: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>("[data-day]");
    const gap = 8;
    const step = card ? (card.offsetWidth + gap) * 5 : el.clientWidth;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: reduced ? "auto" : "smooth" });
  }, []);

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  useEffect(() => {
    fetch("/api/booking/slots")
      .then((r) => r.json())
      .then((data: { slots?: Slot[]; durationMinutes?: number }) => {
        const list = data.slots ?? [];
        if (data.durationMinutes) setDuration(data.durationMinutes);
        setSlots(list);
        setStep(list.length ? "picking" : "error");
      })
      .catch(() => setStep("error"));
  }, []);

  /** Agrupa por dia no fuso do VISITANTE — é o calendário dele que importa. */
  const days = useMemo(() => {
    const map = new Map<string, { label: string; weekday: string; slots: Slot[] }>();
    for (const slot of slots) {
      const date = new Date(slot.start);
      const key = date.toLocaleDateString("en-CA", { timeZone });
      if (!map.has(key)) {
        map.set(key, {
          label: date.toLocaleDateString("en-GB", { timeZone, day: "numeric", month: "short" }),
          weekday: date.toLocaleDateString("en-GB", { timeZone, weekday: "short" }),
          slots: [],
        });
      }
      map.get(key)!.slots.push(slot);
    }
    return [...map.entries()].map(([key, value]) => ({ key, ...value }));
  }, [slots, timeZone]);

  const activeDay = days.find((d) => d.key === selectedDay) ?? days[0];

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [days, syncEdges]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { timeZone, hour: "2-digit", minute: "2-digit" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) return;
    setStep("sending");

    const data = new FormData(event.currentTarget);
    const res = await fetch("/api/booking/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: selectedSlot,
        name: data.get("name"),
        email: data.get("email"),
        company: data.get("company"),
        notes: data.get("notes"),
        website: data.get("website"),
        timeZone,
      }),
    }).then((r) => r.json().then((j) => ({ ok: r.ok, ...j })));

    if (res.ok) {
      setResult({ meetLink: res.meetLink });
      setStep("done");
    } else {
      setMessage(res.message ?? "Something went wrong.");
      setStep("picking");
      setSelectedSlot(null);
    }
  }

  if (step === "loading") {
    return (
      <div className="grid min-h-96 place-items-center rounded-(--radius-card) border border-border bg-surface/40">
        <p className="text-sm text-muted">Loading availability…</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="grid min-h-96 place-items-center rounded-(--radius-card) border border-border bg-surface/40 p-8 text-center">
        <div>
          <p className="text-sm text-muted">No times available right now.</p>
          <a
            href="mailto:emanuel@caaju.com.br"
            className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
          >
            Email me instead
          </a>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="rounded-(--radius-card) border border-primary/40 bg-surface p-10 text-center">
        <h2 className="text-h3">You&apos;re booked</h2>
        <p className="mt-4 text-sm text-muted text-pretty">
          A calendar invite is on its way to your inbox. You can reschedule or cancel from
          the invite itself — no need to email me.
        </p>
        {result?.meetLink && (
          <a
            href={result.meetLink}
            className="mt-6 inline-block text-sm text-primary underline underline-offset-4"
          >
            Meeting link
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-(--radius-card) border border-border bg-surface p-6 md:p-8">
      {step !== "details" && step !== "sending" && (
        <>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-h3">Pick a time</h2>

            <div className="flex items-center gap-3">
              <p className="hidden text-xs text-subtle sm:block">
                {timeZone.replace(/_/g, " ")}
              </p>
              <div className="flex gap-1">
                <NavArrow
                  direction="prev"
                  disabled={!edges.left}
                  onClick={() => scrollWeek(-1)}
                />
                <NavArrow
                  direction="next"
                  disabled={!edges.right}
                  onClick={() => scrollWeek(1)}
                />
              </div>
            </div>
          </div>

          <div className="relative mt-6">
            {/* Degradês nas bordas sinalizando que há mais dias */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface to-transparent transition-opacity duration-300",
                edges.left ? "opacity-100" : "opacity-0",
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent transition-opacity duration-300",
                edges.right ? "opacity-100" : "opacity-0",
              )}
            />

            <div
              ref={stripRef}
              onScroll={syncEdges}
              className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-2"
            >
              {days.map((day) => (
                <button
                  key={day.key}
                  data-day
                  type="button"
                  onClick={() => {
                    setSelectedDay(day.key);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    "shrink-0 snap-start rounded-xl border px-4 py-3 text-center transition-colors",
                    activeDay?.key === day.key
                      ? "border-primary/60 bg-primary/10 text-text"
                      : "border-border text-muted hover:border-primary/30 hover:text-text",
                  )}
                >
                  <span className="block text-[0.65rem] uppercase tracking-wider opacity-70">
                    {day.weekday}
                  </span>
                  <span className="mt-1 block text-sm font-medium">{day.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {activeDay?.slots.map((slot) => (
              <button
                key={slot.start}
                type="button"
                onClick={() => { setSelectedSlot(slot.start); setStep("details"); }}
                className="rounded-xl border border-border py-3 text-sm text-muted transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-text"
              >
                {formatTime(slot.start)}
              </button>
            ))}
          </div>

          {message && <p className="mt-4 text-sm text-warning">{message}</p>}
        </>
      )}

      {(step === "details" || step === "sending") && selectedSlot && (
        <form onSubmit={submit} className="space-y-4">
          <button
            type="button"
            onClick={() => { setSelectedSlot(null); setStep("picking"); }}
            className="text-xs text-muted hover:text-text"
          >
            ← Change time
          </button>

          <p className="text-lead">
            {new Date(selectedSlot).toLocaleDateString("en-GB", {
              timeZone, weekday: "long", day: "numeric", month: "long",
            })}
            {" · "}
            {formatTime(selectedSlot)}
          </p>
          <p className="!mt-1 text-xs text-subtle">
            {duration} minutes · {timeZone.replace(/_/g, " ")}
          </p>

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-muted">Name</label>
              <input id="name" name="name" required autoComplete="name" className={field} />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-muted">Work email</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                placeholder="you@company.com" className={field} />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="mb-2 block text-sm text-muted">Company</label>
            <input id="company" name="company" autoComplete="organization" className={field} />
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm text-muted">
              What&apos;s going on with design right now?
            </label>
            <textarea id="notes" name="notes" rows={3}
              placeholder="A sentence or two is plenty." className={field} />
          </div>

          <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={step === "sending"}>
            {step === "sending" ? "Booking…" : "Confirm booking"}
          </Button>
        </form>
      )}
    </div>
  );
}
