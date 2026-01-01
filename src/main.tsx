import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {  createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./App.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";

export const router = createRouter({
  routeTree,
  context: {
    // Initial context value
    auth: undefined!, 
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}
