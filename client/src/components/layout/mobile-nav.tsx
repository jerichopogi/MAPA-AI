import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Routes } from "@/lib/constants";

const MobileNav = () => {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg md:hidden border-t border-neutral-200">
      <div className="flex justify-around items-center h-16">
        <Link href={Routes.DASHBOARD}>
          <a className={`flex flex-col items-center justify-center w-full ${location === Routes.DASHBOARD ? 'text-primary' : 'text-neutral-500'}`}>
            <i className="fas fa-compass text-lg"></i>
            <span className="text-xs mt-1">Explore</span>
          </a>
        </Link>
        <Link href={Routes.MY_TRIPS}>
          <a className={`flex flex-col items-center justify-center w-full ${location === Routes.MY_TRIPS ? 'text-primary' : 'text-neutral-500'}`}>
            <i className="fas fa-suitcase text-lg"></i>
            <span className="text-xs mt-1">My Trips</span>
          </a>
        </Link>
        <Link href={Routes.LOCAL_SECRETS}>
          <a className={`flex flex-col items-center justify-center w-full ${location === Routes.LOCAL_SECRETS ? 'text-primary' : 'text-neutral-500'}`}>
            <i className="fas fa-map-marker-alt text-lg"></i>
            <span className="text-xs mt-1">Local</span>
          </a>
        </Link>
        <Link href={Routes.TRAVEL_INFO}>
          <a className={`flex flex-col items-center justify-center w-full ${location === Routes.TRAVEL_INFO ? 'text-primary' : 'text-neutral-500'}`}>
            <i className="fas fa-info-circle text-lg"></i>
            <span className="text-xs mt-1">Info</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
