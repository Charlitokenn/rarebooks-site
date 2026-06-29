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
import { Textarea } from "@components/components/ui/textarea";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  businessName: z.string().min(1, "Business name is required"),
  email: z.email("Please enter a valid email address"),
  mobile: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid mobile number",
  }),
  message: z.string().min(1, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactUsFormProps {
  id: string;
  country: string;
}

export function ContactUsForm({ id, country }: ContactUsFormProps) {
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
      businessName: "",
      email: "",
      mobile: "",
      message: "",
    },
  });

  const mobileValue = watch("mobile");

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      setStatus("Submitting enquiry...");
      // Artificial delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 200));

      const response = await fetch("/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send enquiry");
      }

      setStatus("Sending enquiry...");
      // Artificial delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error submitting enquiry:", error);
      setError(
        error.message || "Something went wrong. Please try again later.",
      );
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
            Your Enquiry has been sent!
          </h3>
          <p className="mt-1 text-sm text-muted">
            We'll review your enquiry and get back to you asap
          </p>
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

  return (
    <div className="p-6 md:p-8" data-success={isSuccess}>
      <h4 className="font-display text-lg font-semibold text-ink">
        Enquiry Form
      </h4>

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
        <div className="grid grid-cols-2 gap-3">
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
              placeholder="john@abctrading.com"
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
        </div>

        <div>
          <label
            htmlFor={`${id}-business-name`}
            className="block text-xs font-semibold text-ink"
          >
            Business Name
          </label>
          <Input
            id={`${id}-business-name`}
            type="business-name"
            aria-label="business-name"
            placeholder="ABC Trading"
            {...register("businessName")}
            aria-invalid={!!errors.businessName}
            className="mt-1"
            disabled={isSubmitting}
          />
          {errors.businessName && (
            <p className="mt-0.5 text-xs text-accent-coral">
              {errors.businessName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${id}-message`}
            className="block text-xs font-semibold text-ink"
          >
            Message
          </label>
          <Textarea
            id={`${id}-message`}
            aria-label="message"
            placeholder="Your message"
            {...register("message")}
            aria-invalid={!!errors.message}
            className="mt-1"
            aria-multiline={true}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-0.5 text-xs text-accent-coral">
              {errors.message.message}
            </p>
          )}
        </div>

        {error && (
          <Alert className="mt-6 max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error submitting form!</AlertTitle>
            <AlertDescription className="whitespace-nowrap">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="mt-2 w-full rounded-lg bg-brand px-6 py-4 text-sm font-semibold text-white shadow-soft transition-transform cursor-pointer hover:bg-brand/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status || "Submitting..."}
            </>
          ) : (
            "Submit Enquiry"
          )}
        </Button>
      </form>
    </div>
  );
}
