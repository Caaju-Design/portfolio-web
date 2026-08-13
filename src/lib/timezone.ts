/**
 * Conversão entre horário local de um fuso e instante UTC, sem dependências.
 * Usa Intl para descobrir o offset real na data — o que cobre horário de verão
 * automaticamente, inclusive em fusos que mudam de regra.
 */

function offsetMs(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const parts = Object.fromEntries(
    dtf.formatToParts(new Date(utcMs))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  ) as Record<string, number>;

  const asUtc = Date.UTC(
    parts.year, parts.month - 1, parts.day,
    parts.hour === 24 ? 0 : parts.hour, parts.minute, parts.second,
  );
  return asUtc - utcMs;
}

/** Converte "2026-08-20 09:00 em America/Sao_Paulo" para o instante UTC. */
export function zonedToUtc(
  year: number, month: number, day: number,
  hour: number, minute: number, timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // Duas passadas resolvem a borda de horário de verão.
  let utc = guess - offsetMs(guess, timeZone);
  utc = guess - offsetMs(utc, timeZone);
  return utc;
}

/** Partes de data no fuso informado. */
export function partsInZone(utcMs: number, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short",
  });
  const p = dtf.formatToParts(new Date(utcMs));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday"),
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
  };
}
