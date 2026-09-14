import { createFileRoute } from "@tanstack/react-router";
import { PaddiePodsPage } from "@/pages/app/pods";

export const Route = createFileRoute("/_app/pods")({
	component: PaddiePodsPage,
});
