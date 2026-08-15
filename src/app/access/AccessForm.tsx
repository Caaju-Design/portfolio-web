"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const field =
  "w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm text-text " +
  "placeholder:text-subtle focus:border-primary/60 focus:outline-none";

export function AccessForm({ caseSlug }: { caseSlug: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "broken">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const data = new FormData(event.currentTarget);

    // Guarda o e-mail para o passo de verificação no mesmo dispositivo.
    // Se abrir em outro aparelho, pedimos o e-mail novamente — é o
    // comportamento correto do fluxo de link mágico do Firebase.
    window.localStorage.setItem("caaju:accessEmail", String(data.get("email") ?? ""));

    let response: Response;
    try {
      response = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          jobTitle: data.get("jobTitle"),
          website: data.get("website"), // honeypot
          caseSlug,
        }),
      });
    } catch (error) {
      console.error("[access] requisição não completou", error);
      setState("broken");
      return;
    }

    // A resposta genérica de sucesso existe para impedir enumeração de e-mail:
    // "existe" e "não existe" precisam ser indistinguíveis. Isso continua valendo.
    //
    // Mas 4xx aqui não fala sobre nenhum usuário — fala sobre a requisição estar
    // malformada, e isso é bug nosso. Mostrar sucesso nesse caso é mentir para o
    // visitante e esconder o defeito de nós mesmos.
    if (!response.ok) {
      console.error("[access] pedido recusado", response.status, await response.text());
      setState("broken");
      return;
    }

    setState("sent");
  }

  if (state === "broken") {
    return (
      <div className="rounded-(--radius-card) border border-border bg-surface p-8 text-center">
        <h2 className="text-h3">Something went wrong on our side</h2>
        <p className="mt-3 text-sm text-muted text-pretty">
          The request could not be completed. This is not about your address — it is a
          problem here. Please try again, or write to{" "}
          <a href="mailto:emanuel@caaju.com.br" className="text-primary underline">
            emanuel@caaju.com.br
          </a>{" "}
          and I will send the link myself.
        </p>
        <Button onClick={() => setState("idle")} className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="rounded-(--radius-card) border border-primary/30 bg-surface p-8 text-center">
        <h2 className="text-h3">Check your inbox</h2>
        <p className="mt-3 text-sm text-muted text-pretty">
          If everything checks out, you&apos;ll receive a secure link shortly. It expires in
          15 minutes and works only for the address you entered.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-muted">
          Work email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email"
          placeholder="you@company.com" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className="mb-2 block text-sm text-muted">
            Company
          </label>
          <input id="company" name="company" type="text" autoComplete="organization"
            placeholder="Acme Inc." className={field} />
        </div>
        <div>
          <label htmlFor="jobTitle" className="mb-2 block text-sm text-muted">
            Role
          </label>
          <input id="jobTitle" name="jobTitle" type="text" autoComplete="organization-title"
            placeholder="VP of Product" className={field} />
        </div>
      </div>

      {/* Honeypot — invisível para humanos, irresistível para bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send me the link"}
      </Button>

      <p className="text-xs leading-relaxed text-subtle">
        Your email is used to grant access and to record who viewed confidential client
        material, as required by the NDAs I work under. It is stored for 24 months and never
        shared. You can request deletion at any time.
      </p>
    </form>
  );
}
