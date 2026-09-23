import { LegalLayout } from "@/pages/public/legal-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout title="Terms and Conditions" updated="23 September 2026">
      <p>
        By creating an account or using Padlupp, you agree to use the service
        lawfully, respectfully, and in accordance with these terms.
      </p>
      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for accurate account information, safeguarding your
          credentials, and activity performed through your account. Tell us promptly
          if you suspect unauthorized access.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not harass others, impersonate people, distribute unlawful or harmful
          content, interfere with the service, scrape private information, or use
          Padlupp to violate another person&apos;s rights. We may restrict or remove
          accounts and content that create risk or violate these terms.
        </p>
      </section>
      <section>
        <h2>Your content</h2>
        <p>
          You retain ownership of content you submit. You grant Padlupp the limited
          rights needed to host, process, display, and transmit that content so the
          requested features can operate. Only share content you have the right to use.
        </p>
      </section>
      <section>
        <h2>Service availability</h2>
        <p>
          We work to keep Padlupp reliable, but features may change and access may
          occasionally be interrupted. Padlupp supports personal accountability and
          is not a substitute for medical, legal, financial, or emergency services.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href="mailto:info@padlupp.com">info@padlupp.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
