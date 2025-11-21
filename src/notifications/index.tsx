import { FC, PropsWithChildren } from "react";
import Toaster from "./toaster";

const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
};

export default NotificationProvider;
