import { LegalLayout } from "@/pages/public/legal-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account-deletion")({
  component: AccountDeletion,
});

function AccountDeletion() {
  return (
    <LegalLayout title="Delete your Padlupp account" updated="23 September 2026">
      <p>
        Padlupp and Padlupp Mobile users can request permanent deletion of their
        account and associated personal data from inside the app.
      </p>

      <section>
        <h2>Request deletion</h2>
        <ol>
          <li>Sign in to Padlupp or Padlupp Mobile.</li>
          <li>Open your profile, then select Settings.</li>
          <li>Select Delete account.</li>
          <li>Enter a reason and confirm the deletion request.</li>
        </ol>
        <p>
          If you cannot access your account, email{" "}
          <a href="mailto:info@padlupp.com">info@padlupp.com</a> from the email
          address registered to your account and ask for account deletion.
        </p>
      </section>

      <section>
        <h2>What is deleted</h2>
        <p>
          We delete or de-identify your account details, profile and matching
          information, notification tokens, goals, tasks, check-ins, messages,
          attachments, evidence, invitations, and other content associated with
          your account, subject to the limited retention described below.
        </p>
      </section>

      <section>
        <h2>Limited retention</h2>
        <p>
          Limited records may be retained only where reasonably required for legal
          compliance, security, fraud and abuse prevention, dispute resolution, or
          backup recovery. Backup copies are removed through normal backup rotation
          and are not used for ordinary product operations.
        </p>
      </section>
    </LegalLayout>
  );
}
