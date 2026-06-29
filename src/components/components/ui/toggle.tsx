import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "./switch.tsx";
import { useState } from "react";

export const SubscriptionToggle = () => {
  const { monthly, setMonthly } = useState("true");
  const subsDuration = local ? "yearly" : "monthly";

  return (
    <div
      className="group inline-flex items-center gap-2 pr-5"
      data-state={monthly ? "checked" : "unchecked"}
    >
      <span
        className="group-data-[state=checked]:text-muted-foreground/70 cursor-pointer"
        onClick={() => setMonthly("false")}
      >
        <SunIcon className="size-4" aria-hidden="true" />
      </span>
      <Switch
        checked={monthly}
        onCheckedChange={() => setMonthly(monthly ? "true" : "false")}
        aria-label="Toggle between dark and light mode"
      />
      <span
        className="group-data-[state=unchecked]:text-muted-foreground/70 cursor-pointer"
        onClick={() => setMonthly("false")}
      >
        <MoonIcon className="size-4" aria-hidden="true" />
      </span>
    </div>
  );
};
