import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import { env } from 'cloudflare:workers';

import { AppConfig } from '../../constants';
import TrialLicenseEmail from '../../components/templates/trial-license-sent';

import {isTanzania} from "../../constants/pricing";

export const prerender = false;

const countryCode = Astro.locals.countryCode || "US";
const isLocal =  isTanzania(countryCode);

const resendKey = import.meta.env.RESEND_API_KEY;
// Note: We don't initialize Resend here globally because it might fail if the key is missing at load time.
// We'll initialize it inside the handler if needed, or use it carefully.

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const resend = new Resend(resendKey || env.RESEND_API_KEY);
    const contentType = request.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      // Fallback for cases where content-type might be missing or different
      // but the body is still JSON-like or form-data-like
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
      }
    }

    const { firstName, lastName, email, mobile } = data;

    console.log('License submission data:', { firstName, lastName, email, mobile: !!mobile });

    if (!firstName || !lastName || !email) {
      console.warn('Missing required fields:', { firstName: !!firstName, lastName: !!lastName, email: !!email });
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const apiKey = import.meta.env.KEYMINT_API_KEY || env.KEYMINT_API_KEY;
    if (!apiKey) {
      console.error('KEYMINT_API_KEY is not defined');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
    }

    const expiryDate = new Date();
    const daysToExpiry = islocal ? AppConfig.trial.localDuration : AppConfig.trial.abroadDuration
    expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

    const keymintBody = {
      productId: AppConfig.keymint.productId,
      maxActivations: "2",
      newCustomer: {
        name: `${firstName} ${lastName}`,
        email: email,
      },
      metadata: {
        is_trial: true,
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

    const response = await fetch("https://api.keymint.dev/key", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keymintBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      let userMessage = 'Failed to generate license key';
      const errorCode = errorData.code;

      if (response.status === 400) {
        userMessage = 'Invalid request parameters. Please check your input.';
      } else if (response.status === 401) {
        userMessage = 'Server configuration error (Unauthorized).';
      } else if (response.status === 403) {
        if (errorCode === 2) userMessage = 'License limit reached or product restricted.';
        else if (errorCode === 3) userMessage = 'Unauthorized device access.';
        else userMessage = 'Access forbidden.';
      } else if (response.status === 404) {
        userMessage = 'Product or resource not found.';
      } else if (response.status === 409) {
        userMessage = 'A trial license has already been issued for this email address/mobile.';
      } else if (response.status === 429) {
        userMessage = 'Too many requests. Please try again later.';
      }

      return new Response(JSON.stringify({
        message: userMessage,
        details: errorData.message || null,
        code: errorCode
      }), { status: response.status });
    }

    const result = await response.json();
    
    // KeyMint returns an array of keys when amountKeys > 1, or a single object/array depending on the endpoint.
    // Based on the code, it expects result[0]?.key
    const licenseKey = Array.isArray(result) ? result[0]?.key : result?.key;

    const storeUrl = import.meta.env.STORE_URL || env.STORE_URL || AppConfig.storeUrl || '#';

    if (licenseKey) {
      try {
        console.log('Attempting to send email via Resend to:', email);

        const html = await render(
          React.createElement(TrialLicenseEmail, {
            firstName: firstName,
            licenseKey: licenseKey,
            expiryDate: expiryDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            storeUrl: storeUrl
          })
        );

        const emailResult = await resend.emails.send({
          //TODO: Change this email in production
          from: 'Charles | RareBooks <onboarding@resend.dev>',
          to: email,
          subject: 'Your Trial License Key',
          html,
        });
      } catch (emailError) {
        console.error('Error sending email with Resend:', emailError);
        // We don't necessarily want to fail the whole request if the email fails, 
        // but we should probably log it. The user already has the key in the response result.
      }

      // Save to Cloudflare D1
      try {
        const db = env.DB;

        if (db) {
          const dbResult = await db.prepare(
            'INSERT INTO trials (first_name, last_name, email, mobile, expiry_date, license_key, subscription_amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            firstName,
            lastName,
            email,
            mobile || null,
            expiryDate.toISOString(),
            licenseKey,
            0 // Trial license has 0 subscription amount
          ).run();
        } else {
          console.error('D1 Database binding (DB) not found in env. Available env keys:', Object.keys(env));
        }
      } catch (dbError: any) {
        console.error('Error saving to D1 database:', {
          message: dbError.message,
          cause: dbError.cause,
          stack: dbError.stack
        });
        // Again, don't fail the whole request if saving to DB fails, but log it.
      }
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in license API route:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
