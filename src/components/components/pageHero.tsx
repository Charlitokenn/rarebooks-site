import { Moon, Sun, Sunset } from "lucide-react";
import React, { type JSX } from "react";

type PageHeroProps = {
  title?: string;
  subtitle?: string;
  type: "greeting" | "hero";
};

export const PageHero = ({
  title,
  subtitle,
  type,
}: PageHeroProps): JSX.Element => {
  return (
    <div className="flex items-center text-primary justify-between gap-4 ">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          {type !== "hero" && getTimeBasedIcon()}
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export function getTimeBasedIcon(date: Date = new Date()): JSX.Element {
  const hour = date.getHours();

  // 🌙 Night: 19 → 04
  if (hour >= 19 || hour < 5) {
    return <Moon className="size-5" />;
  }

  // 🌅 Sunrise: 05 → 08
  // if (hour >= 5 && hour < 9) {
  //   return <DayCloudyIcon className="size-7" />
  // }

  // ☀️ Day: 05 → 16
  if (hour >= 5 && hour < 17) {
    return <Sun className="size-5" />;
  }

  // 🌇 Sunset: 17 → 18
  return <Sunset className="size-5" />;
}
