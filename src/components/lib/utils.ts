import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function NormalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");

  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Gmail: dots ignored, + aliases ignored
    return local.replace(/\./g, ".").split("+")[0] + "@gmail.com";
  }

  // All other providers: preserve dots and +, only normalize case
  return local + "@" + domain;
}

export function Capitalize(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function GetInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.trim().charAt(0).toUpperCase() ?? "";
  const l = lastName?.trim().charAt(0).toUpperCase() ?? "";
  return `${f}${l}`;
}

interface GreetingProps {
  title: string;
  subtitle: string;
  timeOfDay: "morning" | "afternoon" | "evening";
}

export function GetGreetingProps(name?: string | null | undefined): GreetingProps {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const displayName = name?.trim() || "there";

  // Titles: standard, warm, welcoming, encouraging
  const titles: Record<string, string[]> = {
    morning: [
      "Good morning",
      "Morning",
    ],
    afternoon: [
      "Good afternoon",
      "Afternoon",
    ],
    evening: [
      "Good evening",
      "Evening",
    ],
  };

  // Subtitles: quirky, playful, energetic
  const subtitles: Record<string, string[]> = {
    morning: [
      "Coffee's brewing, dreams are brewing",
      "Another day, another chance to not hit snooze",
      "The early bird gets the worm, but you get the coffee",
      "Morning person alert (or just pretending)",
      "Sun's up, you're up, let's do this thing",
      "Plot twist: today might actually be awesome",
      "Your bed called, it misses you already",
      "Rise like a sourdough starter",
      "Morning mood: main character energy",
      "Alarm clock: 0, You: 1",
      "New day, who dis?",
      "Coffee first, adulting second",
      "You survived the night, trophy pending",
      "Morning vibes: aggressively optimistic",
      "Your pillow is sad, but your goals are happy",
    ],
    afternoon: [
      "Lunch break? More like victory lap",
      "Still standing? You're basically a superhero",
      "Afternoon slump? Not on your watch",
      "You're halfway to freedom, keep going",
      "Slaying the day, one email at a time",
      "Afternoon mood: caffeinated and dangerous",
      "You're like a Monday, but make it fabulous",
      "Still awake? The plants are proud of you",
      "Afternoon check: are you a zombie yet?",
      "You're thriving, or at least surviving with style",
      "Midday magic in progress",
      "You're the main character, the afternoon is your montage",
      "Snack time = brain fuel time",
      "You're doing better than your Wi-Fi today",
      "Afternoon energy: 100% chaos, 100% charm",
    ],
    evening: [
      "You survived the day, confetti is implied",
      "Evening mode: pajamas optional, relaxation mandatory",
      "Your couch missed you, go say hi",
      "Day complete, achievement unlocked",
      "Evening status: offline and unbothered",
      "You adulted hard today, time to retire.",
      "Evening forecast: 100% chance of cozy",
      "Your bed is sending you love letters",
      "You crushed it, now let the couch crush you",
      "Evening ritual: pretend tomorrow doesn't exist yet",
      "Today's plot twist: you actually did great",
      "Evening vibe: human-shaped puddle of calm",
      "You've earned the right to do absolutely nothing",
      "Evening report: survived, thrived, now horizontal",
      "Time to transform from productivity mode to potato mode",
    ],
  };

  const titlePool = titles[timeOfDay];
  const subtitlePool = subtitles[timeOfDay];

  const title = `${titlePool[Math.floor(Math.random() * titlePool.length)]}, ${displayName}`;
  const subtitle = subtitlePool[Math.floor(Math.random() * subtitlePool.length)];

  return { title, subtitle, timeOfDay };
}