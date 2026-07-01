import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

const jsonHeaders = { "Content-Type": "application/json" };

interface ClickPesaTokenResponse {
  success: boolean;
  token: string;
}

export const GET: APIRoute = async () => {
  try {
    const clientId = env.CLICKPESA_CLIENT_ID;
    const apiKey = env.CLICKPESA_API_KEY;

    if (!clientId || !apiKey) {
      return new Response(
          JSON.stringify({
            message: "Payment provider configuration error",
            methods: getDefaultPaymentMethods(),
          }),
          { status: 200, headers: jsonHeaders }
      );
    }

    // Step 1: Generate ClickPesa auth token
    const tokenResponse = await fetch(
        "https://api.clickpesa.com/third-parties/generate-token",
        {
          method: "POST",
          headers: {
            "client-id": clientId,
            "api-key": apiKey,
          },
        }
    );

    if (!tokenResponse.ok) {
      return new Response(
          JSON.stringify({
            message: "Failed to authenticate with payment provider",
            methods: getDefaultPaymentMethods(),
          }),
          { status: 200, headers: jsonHeaders }
      );
    }

    const tokenData: ClickPesaTokenResponse = await tokenResponse.json();
    const authToken = tokenData.token;

    // Step 2: Fetch payment methods from ClickPesa
    // ClickPesa provides methods via their collection APIs
    // For now, we return the standard methods available in Tanzania
    // plus card payments for international users
    const methods = await fetchClickPesaPaymentMethods(authToken);

    return new Response(
        JSON.stringify({
          methods,
          code: 0,
        }),
        { status: 200, headers: jsonHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return new Response(
        JSON.stringify({
          message: "Failed to fetch payment methods",
          methods: getDefaultPaymentMethods(),
        }),
        { status: 200, headers: jsonHeaders }
    );
  }
};

// Helper: Fetch payment methods from ClickPesa
async function fetchClickPesaPaymentMethods(authToken: string) {
  try {
    const response = await fetch(
        "https://api.clickpesa.com/third-parties/payment-methods",
        {
          method: "GET",
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
    );

    if (!response.ok) {
      return getDefaultPaymentMethods();
    }

    const data = await response.json();
    return data.methods || getDefaultPaymentMethods();
  } catch {
    return getDefaultPaymentMethods();
  }
}

// Fallback default payment methods
function getDefaultPaymentMethods() {
  return [
    {
      id: "mpesa",
      name: "M-Pesa",
      provider: "Vodacom",
      icon: "smartphone",
      type: "mobile_money",
      currencies: ["TZS"],
    },
    {
      id: "airtel",
      name: "Airtel Money",
      provider: "Airtel",
      icon: "smartphone",
      type: "mobile_money",
      currencies: ["TZS"],
    },
    {
      id: "halopesa",
      name: "HaloPesa",
      provider: "Halotel",
      icon: "zap",
      type: "mobile_money",
      currencies: ["TZS"],
    },
    {
      id: "tigopesa",
      name: "Tigo Pesa",
      provider: "Tigo",
      icon: "smartphone",
      type: "mobile_money",
      currencies: ["TZS"],
    },
    {
      id: "card",
      name: "Card Payment",
      provider: "Visa / Mastercard",
      icon: "credit-card",
      type: "card",
      currencies: ["TZS", "USD"],
    },
  ];
}