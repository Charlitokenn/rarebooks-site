import { Moon, Sun, Sunrise } from "lucide-react";
import React, { type JSX } from "react";
import {AppConfig} from "../../constants";

type TimeOfDay = "morning" | "afternoon" | "evening";

type PageHeroProps = {
  title?: string;
  subtitle?: string;
  type: "greeting" | "hero";
  timeOfDay?: TimeOfDay;
};

export const PageHero = ({
                           title,
                           subtitle,
                           type,
                           timeOfDay,
                         }: PageHeroProps): JSX.Element => {
  return (
      <div className="flex items-center text-primary justify-between gap-4 ">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            {type !== "hero" && getTimeBasedIcon(timeOfDay)}
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <a href={AppConfig.urls.documentationUrl} className="text-sm font-medium text-primary hover:underline cursor-pointer">
          Documentation
        </a>
      </div>
  );
};

export function getTimeBasedIcon(timeOfDay: TimeOfDay = "morning"): JSX.Element {
  switch (timeOfDay) {
    case "morning":
      return <Sunrise className="size-5" />;
    case "afternoon":
      return <Sun className="size-5" />;
    case "evening":
    default:
      return <Moon className="size-5" />;
  }
}