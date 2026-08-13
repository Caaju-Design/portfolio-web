"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

import { clientAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";

type State = "checking" | "need-email" | "exchanging" | "error";

export function VerifyClient({ caseSlug }: { caseSlug: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [email, setEmail] = useState("");
  const ran = useRef(false);

  const exchange = useCallback(
    async (address: string) => {
      setState("exchanging");
      try {
        const credential = await signInWithEmailLink(clientAuth(), address, window.location.href);
        const idToken = await credential.user.getIdToken();

        const response = await fetch("/api/access/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, caseSlug }),
        });

        if (!response.ok) throw new Error("session rejected");
        router.replace(`/work/${caseSlug}/deep`);
      } catch {
        setState("error");
      }
    },
    [caseSlug, router],
  );

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!isSignInWithEmailLink(clientAuth(), window.location.href)) {
      setState("error");
      return;
    }

    // Mesmo dispositivo: o e-mail foi guardado ao pedir o link.
    const stored = window.localStorage.getItem("caaju:accessEmail");
    if (stored) {
      window.localStorage.removeItem("caaju:accessEmail");
      void exchange(stored);
      return;
    }
    setState("need-email");
  }, [exchange]);

  if (state === "error") {
    return (
      <div className="text-center">
        <h1 className="text-h2">This link didn&apos;t work</h1>
        <p className="mt-4 text-muted">
          It may have expired, already been used, or been opened on a different device.
        </p>
        <Button href="/access" className="mt-8">
          Request a new link
        </Button>
      </div>
    );
  }

  if (state === "need-email") {
    return (
      <form
        className="mx-auto max-w-sm text-center"
        onSubmit={(e) => {
          e.preventDefault();
          void exchange(email);
        }}
      >
        <h1 className="text-h2">Confirm your email</h1>
        <p className="mt-4 text-sm text-muted">
          You opened the link on a different device. Enter the address you used.
        </p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-6 w-full rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm focus:border-primary/60 focus:outline-none"
        />
        <Button type="submit" className="mt-4 w-full">
          Continue
        </Button>
      </form>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-h2">Verifying your access…</h1>
      <p className="mt-4 text-muted">One moment.</p>
    </div>
  );
}
