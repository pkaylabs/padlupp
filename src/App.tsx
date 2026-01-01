import "./App.css";
import { useAuthStore } from "./features/auth/authStore";
import { router } from "./main";
import NotificationProvider from "./notifications";
import { RouterProvider } from "@tanstack/react-router";

function App() {
  const auth = useAuthStore();

  return <RouterProvider router={router} context={{ auth }} />;
}

export default App;
