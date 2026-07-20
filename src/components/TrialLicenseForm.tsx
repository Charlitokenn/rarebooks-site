import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { PhoneInput } from "./reui/phone-input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Loader2, AlertCircle } from "lucide-react";
import { NormalizeEmail } from "@components/lib/utils.ts";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please enter a valid email address").transform(NormalizeEmail),
  mobile: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid mobile number",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TrialLicenseFormProps {
  id: string;
  country: string;
}

export function TrialLicenseForm({ id, country }: TrialLicenseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
    },
  });

  const mobileValue = watch("mobile");

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      setStatus("Generating license with your info...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const response = await fetch("/api/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // ✅ FIX: Read text first, then parse
      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(`Server returned invalid response (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result.message || "Failed to send license key");
      }

      setStatus("Sending license to your email...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      // GTM: fire the trial signup conversion event, carrying whichever
      // plan (if any) was selected on the pricing page - see the click
      // handler in Layout.astro that writes this to sessionStorage.
      try {
        const storedPlan = sessionStorage.getItem("rb_trial_plan");
        const planData = storedPlan ? JSON.parse(storedPlan) : {};
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: "trial_signup",
          plan_name: planData.plan_name || "Not specified",
          plan_price: planData.plan_price || null,
          billing_period: planData.billing_period || null,
          currency: planData.currency || null,
          country,
        });
        sessionStorage.removeItem("rb_trial_plan");
      } catch (gtmError) {
        console.error("GTM tracking error:", gtmError);
      }

      setStatus("Redirecting you to the download page...");

      // Instead of auto-signing the user into /dashboard, send them to a
      // dedicated download page that confirms registration + tells them
      // to check their email, with a prominent Microsoft Store link.
      // See src/pages/trial/download.astro. The Clerk account + license
      // are still created server-side in /api/license — the user simply
      // isn't auto-logged-in client-side anymore; they can sign in later
      // with the password emailed to them via PortalAccessEmail.
      const params = new URLSearchParams({
        name: data.firstName,
        email: data.email,
      });
      window.location.href = `/trial/download?${params.toString()}`;
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || "Something went wrong. Please try again later.");
    } finally {
      setStatus("");
    }
  };

  // @ts-ignore
  //@ts-ignore
  return (
      <div className="p-6 md:p-8">
        <h4 className="font-display text-lg font-semibold text-ink">
          Licensee Details
        </h4>
        <p className="mt-0.5 text-sm text-muted">Who will own the license?</p>

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-3"
            noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                  htmlFor={`${id}-firstName`}
                  className="block text-xs font-semibold text-ink"
              >
                First name
              </label>
              <Input
                  id={`${id}-firstName`}
                  aria-label="First name"
                  placeholder="John"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                  className="mt-1"
                  disabled={isSubmitting}
              />
              {errors.firstName && (
                  <p className="mt-0.5 text-xs text-accent-coral">
                    {errors.firstName.message}
                  </p>
              )}
            </div>
            <div>
              <label
                  htmlFor={`${id}-lastName`}
                  className="block text-xs font-semibold text-ink"
              >
                Last name
              </label>
              <Input
                  id={`${id}-lastName`}
                  placeholder="Doe"
                  aria-label="Last name"
                  {...register("lastName")}
                  aria-invalid={!!errors.lastName}
                  className="mt-1"
                  disabled={isSubmitting}
              />
              {errors.lastName && (
                  <p className="mt-0.5 text-xs text-accent-coral">
                    {errors.lastName.message}
                  </p>
              )}
            </div>
          </div>

          <div>
            <label
                htmlFor={`${id}-email`}
                className="block text-xs font-semibold text-ink"
            >
              Email address
            </label>
            <Input
                id={`${id}-email`}
                type="email"
                aria-label="email"
                placeholder="john@company.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                className="mt-1"
                disabled={isSubmitting}
            />
            {errors.email && (
                <p className="mt-0.5 text-xs text-accent-coral">
                  {errors.email.message}
                </p>
            )}
          </div>

          <div>
            <label
                htmlFor={`${id}-mobile`}
                className="block text-xs font-semibold text-ink"
            >
              Mobile number
            </label>
            <div className="mt-1">
              <PhoneInput
                  countryCallingCodeEditable={false}
                  //@ts-ignore
                  defaultCountry={country}
                  id={`${id}-mobile`}
                  placeholder={
                    country === "TZ" ? "+255 712 000 000" : "+1 555 555 1234"
                  }
                  value={mobileValue as any}
                  onChange={(v) =>
                      setValue("mobile", v || "", { shouldValidate: true })
                  }
                  aria-invalid={!!errors.mobile}
                  disabled={isSubmitting}
              />
            </div>
            {errors.mobile && (
                <p className="mt-0.5 text-xs text-accent-coral">
                  {errors.mobile.message}
                </p>
            )}
          </div>

          {error && (
              <Alert className="mt-6 max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error sending license key!</AlertTitle>
                <AlertDescription className="whitespace-nowrap">
                  {error}
                </AlertDescription>
              </Alert>
          )}
          <Button
              id="send-free-license"
              type="submit"
              className="mt-2 w-full rounded-lg bg-brand px-6 py-4 text-sm font-semibold text-white shadow-soft transition-transform cursor-pointer hover:bg-brand/90"
              disabled={isSubmitting}
          >
            {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status || "Processing..."}
                </>
            ) : (
                "Send my Free License Key"
            )}
          </Button>
        </form>
      </div>
  );
}