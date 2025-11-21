import TextInput from "@/components/core/inputs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 text-primary-50 font-monts">
      <h3>Welcome Home!</h3>
    </div>
  );
}
