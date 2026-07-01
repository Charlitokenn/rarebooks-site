import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { AppConfig } from "../../constants";
import { isTanzania } from "../../constants/pricing";
import { NormalizeEmail, Capitalize } from "../../components/lib/utils";

export const prerender = false;

const jsonHeaders = { "Content-Type": "application/json" };

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const countryCode = (locals as any)?.countryCode || "US";
    const isLocal = isTanzania(countryCode);

    const bodyText = await request.text();
    let data: any = {};
    try {
      data = JSON.parse(bodyText);
    } catch {
      return new Response(
          JSON.stringify({ message: "Invalid JSON in request body" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const email = NormalizeEmail(data?.email || "");
    const firstName = Capitalize(data?.firstName || "");
    const lastName = Capitalize(data?.lastName || "");
    const plan = data?.plan; // 'diy' | 'dfy'
    const billingCycle = data?.billingCycle; // 'monthly' | 'yearly'
    const mobile = data?.mobile || undefined;

    if (!email || !/^[^\s@]+@[^t]+\.[^@]+$/.test(email)) {
      return new Response(
          JSON.stringify({ message: "Valid email is required" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    if (!plan || !["diy", "dfy"].includes(plan)) {
      return new Response(
          JSON.stringify({ message: "Valid plan selection is required" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    // Calculate expiry date based on plan and billing cycle
    // Local (TZ): only yearly subscriptions
    // International: monthly and yearly options
    const expiryDate = new Date();
    let periodLabel = "";

    if (isLocal) {
      // Tanzania: only yearly
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      periodLabel = "1 Year";
    } else {
      // International: monthly or yearly
      if (billingCycle === "monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        periodLabel = "1 Month";
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        periodLabel = "1 Year";
      }
    }

    // Determine max activations based on plan
    const maxActivations = plan === "diy" ? "2" : "5";

    // Get price based on plan and region
    const planConfig = AppConfig.pricingPlans.find((p: any) => {
      if (plan === "diy") return p.name === "Do It Yourself";
      if (plan === "dfy") return p.name === "Done For You";
      return false;
    });

    const keymintBody = {
      productId: AppConfig.keymint.productId,
      maxActivations,
      customer: {
        name: `${firstName} ${lastName}`,
        email,
      },
      metadata: {
        plan,
        billingCycle: isLocal ? "yearly" : billingCycle,
        countryCode,
        isPaid: true,
      },
      amountKeys: "1",
      expiryDate: expiryDate.toISOString(),
      format: {
        sections: 4,
        sectionLength: 5,
        separator: "-",
        charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        prefix: "RARE-",
        suffix: "-BOOKS",
        case: "upper",
      },
    };

    const kmResponse = await fetch("https://api.keymint.dev/key", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keymintBody),
    });

    const responseText = await kmResponse.text();

    if (!kmResponse.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {
        /* ignore */
      }

      return new Response(
          JSON.stringify({
            message: errorData.message || "Failed to create license",
            code: errorData.code || -1,
          }),
          { status: kmResponse.status, headers: jsonHeaders }
      );
    }

    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      return new Response(
          JSON.stringify({ message: "Invalid response from license server" }),
          { status: 502, headers: jsonHeaders }
      );
    }

    // Return license info with additional metadata
    return new Response(
        JSON.stringify({
          ...result,
          meta: {
            plan,
            billingCycle: isLocal ? "yearly" : billingCycle,
            periodLabel,
            maxActivations: parseInt(maxActivations),
            expiryDate: expiryDate.toISOString(),
            price: planConfig
                ? isLocal
                    ? `TZS ${planConfig.priceTZS}`
                    : `$${billingCycle === "monthly" ? planConfig.priceUSD.monthly : planConfig.priceUSD.yearly}`
                : "Custom",
          },
        }),
        { status: 200, headers: jsonHeaders }
    );
  } catch (error: any) {
    console.error("FATAL error creating license:", error);
    return new Response(
        JSON.stringify({ message: "Internal server error", detail: error.message }),
        { status: 500, headers: jsonHeaders }
    );
  }
};