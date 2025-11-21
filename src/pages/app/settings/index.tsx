import { ProfileSettings } from "./components/profile-settings";
import { SettingsSidebar } from "./components/settings-sidebar";

export const SettingsPage = () => {
  return (
    <div className="flex h-[92vh] overflow-hidden">
      <SettingsSidebar />
      <ProfileSettings />
    </div>
  );
};
