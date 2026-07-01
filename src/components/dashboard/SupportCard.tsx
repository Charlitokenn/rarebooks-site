import * as React from "react";
import { Mail, Phone } from "lucide-react";
import { AppConfig } from "../../constants";

export function SupportCard() {
    return (
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
            <p className="text-primary-foreground/80 text-sm mb-4">
                Having trouble with your license or device activations? Our support team
                is here to help.
            </p>
            <div className="space-y-2">
                <a
                    href={`mailto:${AppConfig.supportEmail}`}
                    className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                    <Mail className="w-4 h-4" />
                    {AppConfig.supportEmail}
                </a>
            </div>
        </div>
    );
}