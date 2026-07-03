import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert.tsx";
import { Loader2, AlertCircle } from "lucide-react";
import { NormalizeEmail } from "@components/lib/utils.ts";
import { signInWithTicket } from "@components/lib/sign-in-with-ticket";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
      .email("Please enter a valid email address")
      .transform(NormalizeEmail),
  password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(256, "Password must not exceed 256 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
      .refine((val) => !/(.)\1{2,}/.test(val), {
        message: "Password must not contain repeated characters (e.g., 'aaa')",
      })
      .refine((val) => !/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(val), {
        message: "Password must not contain sequential characters",
      })
      .refine((val) => !/(password|123456|qwerty|admin|letmein|welcome|monkey|dragon|master|sunshine|princess|football|baseball|iloveyou|trustno1|abc123|password1|admin123|login|default)/i.test(val), {
        message: "Password must not be a commonly used weak password",
      })
      .refine((val) => !/\s/.test(val), {
        message: "Password must not contain whitespace characters",
      }),
  redeemCode: z
      .string()
      .min(13, "Paste redeem code from Appsumo")
      .max(13, "Paste redeem code from Appsumo"),
});

type FormValues = z.infer<typeof formSchema>;

interface RedemptionFormProps {
  id: string;
}

export function RedemptionForm({ id }: RedemptionFormProps) {
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
      password: "",
      redeemCode: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      setStatus("Submitting enquiry...");
      // Artificial delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 200));

      const response = await fetch("/api/redemption", {
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

      setStatus("Signing you in...");
      // Navigates away on success — no further UI updates needed after this.
      await signInWithTicket(
          result.signInToken,
          `/dashboard?welcome=redeem${result.usedFallbackPassword ? "&pwreset=1" : ""}`,
      );
    } catch (error: any) {
      console.error("Error submitting enquiry:", error);
      setError(
          error.message || "Something went wrong. Please try again later.",
      );
    } finally {
      setStatus("");
    }
  };

  return (
      <div className="p-6 md:p-8" data-success={isSuccess}>
        <div className="flex flex-col items-center">
          <h4 className="font-display text-lg mt-4 font-semibold text-ink">
            Create an Account
          </h4>
        </div>

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
                htmlFor={`${id}-password`}
                className="block text-xs font-semibold text-ink"
            >
              Password
            </label>
            <Input
                id={`${id}-password`}
                type="password"
                aria-label="password"
                placeholder="Enter password"
                {...register("password")}
                aria-invalid={!!errors.password}
                className="mt-1"
                disabled={isSubmitting}
            />
            {errors.password && (
                <p className="mt-0.5 text-xs text-accent-coral">
                  {errors.password.message}
                </p>
            )}
          </div>

          <div>
            <label
                htmlFor={`${id}-redeem-code`}
                className="block text-xs font-semibold text-ink"
            >
              AppSumo Redeem Code
            </label>
            <Input
                id={`${id}-redeem-code`}
                type="redeem-code"
                aria-label="redeem-cde"
                placeholder="e.g. RARE-QQQQ3UU1"
                {...register("redeemCode")}
                aria-invalid={!!errors.redeemCode}
                className="mt-1"
                disabled={isSubmitting}
            />
            {errors.redeemCode && (
                <p className="mt-0.5 text-xs text-accent-coral">
                  {errors.redeemCode.message}
                </p>
            )}
          </div>

          {isSuccess && (
              <Alert className="mt-6 max-w-md border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Your lifetime licence key!</AlertTitle>
                <AlertDescription className="whitespace-nowrap">
                  {error}
                  <p className="text-xs">
                    The code has also been sent to your email address
                  </p>
                </AlertDescription>
              </Alert>
          )}
          {error && (
              <Alert className="mt-6 max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error redeeming your licence key!</AlertTitle>
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
                  {status || "Creating account & redeeming..."}
                </>
            ) : (
                "Create Account & Redeem"
            )}
          </Button>
        </form>
      </div>
  );
}