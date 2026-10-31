import { Link } from "@tanstack/react-router";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { navigation } from "@/constants";
import { COMMUNITY, PADDIE_PODS, SETTINGS } from "@/constants/page-path";
import { cn } from "@/utils/cs";
import { CommunityNavGroups, CommunityNavPods } from "./community-nav-groups";
import { navItemClassName } from "./navigation-styles";

export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                {item.href === PADDIE_PODS ? <CommunityNavPods onNavigate={onNavigate} /> : (
                  <Link to={item.href} onClick={onNavigate}>
                    {({ isActive }) => (
                      <div className={navItemClassName(isActive)}>
                        <item.icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                        {item.name}
                      </div>
                    )}
                  </Link>
                )}
                {item.href === COMMUNITY && <CommunityNavGroups onNavigate={onNavigate} />}
              </li>
            ))}
          </ul>
        </li>
        <li className="mt-auto">
          <Link to={SETTINGS} onClick={onNavigate}>
            {({ isActive }) => (
              <div className={cn(navItemClassName(isActive), "mx-0 py-3")}>
                <Cog6ToothIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
                Settings
              </div>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
