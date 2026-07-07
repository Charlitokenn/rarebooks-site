import React from "react";
import { AppConfig } from "../constants";

const AppLogo = ({ link, className }: { link: string; className?: string }) => {
    return (
        <a href={link} className="flex items-center gap-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/20 shrink-0">
        <img src={AppConfig.logo} alt="logo" className="pt-1" loading="eager" />
      </span>
            <span className="font-display text-lg font-bold text-ink group-data-[collapsible=icon]:hidden">
        {AppConfig.appName}
      </span>
        </a>
    );
};
export default AppLogo;