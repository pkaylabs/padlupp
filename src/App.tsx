import "./App.css";
import NotificationProvider from "./notifications";
import { AuthProvider } from "@/components/core/auth-context";
import type { PropsWithChildren, FC } from "react";


const App: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
};

export default App;
