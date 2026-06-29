import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { PhoneInput } from "./reui/phone-input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { AppConfig } from "../constants";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Loader2, AlertCircle } from "lucide-react";
import { normalizeEmail } from "@components/lib/utils.ts";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
      .email("Please enter a valid email address")
      .transform(normalizeEmail),
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
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || "Something went wrong. Please try again later.");
    } finally {
      setStatus("");
    }
  };

  if (isSuccess) {
    return (
        <div
            id={`${id}-success`}
            className="p-6 md:p-8 w-full max-w-xl mx-auto"
            data-success={isSuccess}
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              You're all set!
            </h3>
            <p className="mt-1 text-sm text-muted">
              Your trial license key is on its way.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-black/5 bg-white p-4">
              <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                1
              </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Check your email
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    We've sent your license key to the provided email. It should
                    arrive within a few minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-black/5 bg-white p-4">
              <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                2
              </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Download the app
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Get started by downloading {AppConfig.appName} from the
                    Microsoft Store.
                  </p>
                  <a
                      href={AppConfig.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-xs font-semibold text-white transition-transform"
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                      <path d="M4 4.5V19a1 1 0 0 0 1 1h15" />
                      <path d="M18 8l-5 5-4-4-4 4" />
                    </svg>
                    Microsoft Store
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
                type="button"
                className="modal-close cursor-pointer text-xs font-medium text-muted underline transition-colors hover:text-ink"
                onClick={() => {
                  const dialog = document.getElementById(id) as HTMLDialogElement;
                  if (dialog) dialog.close();
                }}
            >
              Close this window
            </button>
          </div>
        </div>
    );
  }

  // @ts-ignore
  //@ts-ignore
  return (
      <div className="p-6 md:p-8" data-success={isSuccess}>
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
        <div
            id="turnstile-container"
            className="cf-turnstile mt-1"
            data-sitekey="0x4AAAAAADq5yBe8MOqSJN7v"
            data-theme="light"
            data-size="flexible"
            data-callback="onTurnstileSuccess"
            data-error-callback="onTurnstileError"
        ></div>
      </div>
  );
}