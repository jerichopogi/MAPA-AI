import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { UserContext } from "@/App";
import { cn } from "@/lib/utils";
import { APP_NAME, Routes } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const SidebarItem = ({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: string;
  label: string;
  active: boolean;
}) => {
  return (
    <Link href={to}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
          active
            ? "bg-primary text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        )}
      >
        <i className={`fas fa-${icon} mr-3`}></i>
        {label}
      </a>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useContext(UserContext);

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-neutral-200 overflow-y-auto">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-neutral-200">
          <Link href={Routes.DASHBOARD}>
            <h1 className="text-xl font-bold font-sans text-primary flex items-center cursor-pointer">
              <i className="fas fa-map-marked-alt mr-2"></i>
              {APP_NAME.split("AI")[0]}
              <span className="text-secondary">AI</span>
            </h1>
          </Link>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            <SidebarItem
              to={Routes.DASHBOARD}
              icon="compass"
              label="Dashboard"
              active={location === Routes.DASHBOARD}
            />
            <SidebarItem
              to={Routes.MY_TRIPS}
              icon="suitcase"
              label="My Trips"
              active={location === Routes.MY_TRIPS}
            />
            <SidebarItem
              to={Routes.LOCAL_SECRETS}
              icon="map-marker-alt"
              label="Local Secrets"
              active={location === Routes.LOCAL_SECRETS}
            />
            <SidebarItem
              to={Routes.TRAVEL_INFO}
              icon="info-circle"
              label="Travel Info"
              active={location === Routes.TRAVEL_INFO}
            />
            <SidebarItem
              to={Routes.VISA_HELP}
              icon="passport"
              label="Visa Help"
              active={location === Routes.VISA_HELP}
            />
            <SidebarItem
              to={Routes.TRAVEL_PACKAGE}
              icon="concierge-bell"
              label="Travel Package Quote"
              active={location === Routes.TRAVEL_PACKAGE}
            />
          </nav>
        </div>
        {user && (
          <div className="flex-shrink-0 flex border-t border-neutral-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(user.fullName || user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs font-medium text-neutral-500 group-hover:text-neutral-700">
                    View profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
