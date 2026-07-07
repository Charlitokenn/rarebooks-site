import { Moon, Sun, Sunrise } from "lucide-react";
import React, { type JSX, useEffect, useState } from "react";
import { AppConfig } from "../../constants";
import { GetGreetingProps } from "@components/lib/utils";

type TimeOfDay = "morning" | "afternoon" | "evening";

type PageHeroProps = {
    name?: string | null;
    subtitle?: string;
    title?: string; // used when type === "hero" (static, non-greeting heroes)
    type: "greeting" | "hero";
};

export const PageHero = ({
                             name,
                             subtitle: staticSubtitle,
                             title: staticTitle,
                             type,
                         }: PageHeroProps): JSX.Element => {
    const [greeting, setGreeting] = useState<{
        title: string;
        subtitle: string;
        timeOfDay: TimeOfDay;
    } | null>(null);

    useEffect(() => {
        // Intentionally client-only: this reads the visitor's own device clock
        // and timezone via `new Date()` in the browser, not the Worker's (UTC).
        if (type === "greeting") {
            setGreeting(GetGreetingProps(name));
        }
    }, [type, name]);

    const title =
        type === "greeting" ? greeting?.title ?? `Welcome back${name ? `, ${name}` : ""}` : staticTitle;
    const subtitle = type === "greeting" ? greeting?.subtitle ?? staticSubtitle : staticSubtitle;

    return (
        <div className="flex items-center text-primary justify-between gap-4 ">
            <div className="space-y-1">
                <h1 className="flex items-center gap-2 text-2xl font-semibold">
                    {type === "greeting" && greeting && getTimeBasedIcon(greeting.timeOfDay)}
                    {title}
                </h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <a
                href={AppConfig.urls.documentationUrl}
                className="text-sm font-medium text-primary hover:underline cursor-pointer"
                >
                Documentation
            </a>
        </div>
    );
};

export function getTimeBasedIcon(timeOfDay: TimeOfDay): JSX.Element {
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