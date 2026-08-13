import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export default function NotFound() {
  return (
    <Section spacing="loose">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-4 text-h1">This page doesn&apos;t exist</h1>
        <p className="mt-5 text-lead text-muted">
          It may have been moved, or you may not have access to it.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button href="/">Back home</Button>
          <Button href="/work" variant="secondary">
            See the work
          </Button>
        </div>
      </div>
    </Section>
  );
}
