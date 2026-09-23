import { LegalLayout } from "@/pages/public/legal-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  return (
    <LegalLayout title="Contact Padlupp">
      <p>
        For product support, account help, safety concerns, privacy requests, or
        Play Store support, email <a href="mailto:info@padlupp.com">info@padlupp.com</a>.
      </p>
      <p>
        Include the email address associated with your Padlupp account and a short
        description of the issue. Do not send passwords or one-time codes.
      </p>
      <p>
        We aim to acknowledge support requests within five business days.
      </p>
    </LegalLayout>
  );
}
