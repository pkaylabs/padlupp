import { LegalLayout } from "@/pages/public/legal-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="23 September 2026">
      <p>
        Padlupp helps people find accountability partners, set goals, exchange
        messages, and track progress. This policy explains how Padlupp collects,
        uses, and protects information across the Padlupp website and Padlupp
        Mobile app.
      </p>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>Account details such as your name, email address, phone number, and authentication information.</li>
          <li>Profile and matching information, including your experience, interests, goals, and preferences.</li>
          <li>Content you choose to create or share, including goals, tasks, check-ins, messages, attachments, evidence, and invitations.</li>
          <li>Device and technical information such as push-notification tokens, app version, device type, IP address, and diagnostic logs.</li>
          <li>Activity information used to show progress, streaks, reminders, unread messages, and last-seen status.</li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <p>
          We use information to provide and secure the service, authenticate
          accounts, recommend suitable accountability partners, deliver messages
          and invitations, schedule reminders, send opted-in email and push
          notifications, provide support, prevent abuse, and improve reliability.
        </p>
      </section>

      <section>
        <h2>How information is shared</h2>
        <p>
          Profile details and content are shared with other users only as needed
          for the features you use, such as buddy discovery, shared goals, and
          conversations. We also use service providers for hosting, email delivery,
          Google sign-in, Firebase Cloud Messaging, storage, monitoring, and other
          infrastructure. These providers process information on our behalf under
          their applicable terms and safeguards. We do not sell personal information.
        </p>
      </section>

      <section>
        <h2>Notifications and permissions</h2>
        <p>
          Padlupp Mobile may request notification, camera, and media permissions.
          Notifications cover messages, invitations, relationship updates,
          check-ins, and reminders. Camera and media access are used only when you
          choose to upload an avatar, attachment, or progress evidence. You can
          change notification preferences in Padlupp and device permissions in your
          operating-system settings.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          We retain information while your account is active and as reasonably
          necessary to provide the service, meet legal obligations, resolve disputes,
          and protect users. You can request account deletion from the app settings.
          Some limited records may remain where required for security, fraud
          prevention, backups, or legal compliance.
        </p>
      </section>

      <section>
        <h2>Security and international processing</h2>
        <p>
          We use access controls, encryption in transit, restricted production
          credentials, and other reasonable safeguards. No online service can
          guarantee absolute security. Information may be processed in countries
          other than your own where our service providers operate, subject to
          applicable safeguards.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Padlupp Mobile is intended for adults aged 18 and over. Contact us if you
          believe a minor has provided information without appropriate consent.
        </p>
      </section>

      <section>
        <h2>Your choices and contact</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          download, object to processing of, or delete your information. Send
          privacy and data requests to <a href="mailto:info@padlupp.com">info@padlupp.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
