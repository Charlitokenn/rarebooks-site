import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split('@');

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return local.replace(/\./g, '').split('+')[0] + '@gmail.com';
  }

  if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
    return local.split('+')[0] + '@' + domain;
  }

  return local + '@' + domain;
}