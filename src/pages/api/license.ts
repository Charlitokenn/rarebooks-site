import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import { env } from 'cloudflare:workers';
import { DisposableEmailChecker } from '@usex/disposable-email-domains';

import { AppConfig } from '../../constants';
import TrialLicenseEmail from '../../components/templates/trial-license-sent';
import { isTanzania } from '../../constants/pricing';

export const prerender = false;

// Initialize checker with remote URL (lightweight, no heavy bundle)
const checker = new DisposableEmailChecker({
  disposableDomainsUrl: 'https://cdn.jsdelivr.net/gh/ali-master/disposable-email-domains@latest/domains.json',
  enableCaching: true,
  cacheSize: 1000,
  checkMxRecord: false,
});

function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split('@');

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return local.replace(/\./g, '').split('+')[0] + '@gmail.com';
  }

  if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
    return local.split('+')[0] + '@' + domain;
  }

  return local + '@' + domain;
}

const trialSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email address'),
  mobile: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Country code must be read inside the handler, not at module level
    const countryCode = (locals as any).countryCode || 'US';
    const isLocal = isTanzania(countryCode);

    const resend = new Resend(env.RESEND_API_KEY);
    const contentType = request.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
      }
    }

    // 1. Zod validation (format only)
    const parseResult = trialSchema.safeParse(data);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid input';
      return new Response(JSON.stringify({ message: firstError }), { status: 400 });
    }

    const { firstName, lastName, email: rawEmail, mobile } = parseResult.data;

    // 2. Normalize email
    const normalizedEmail = normalizeEmail(rawEmail);

    // 3. Check disposable (async — after Zod)
    const checkResult = await checker.checkEmail(normalizedEmail);
    if (checkResult.isDisposable) {
      return new Response(
          JSON.stringify({ message: 'Disposable email addresses are not allowed' }),
          { status: 400 }
      );
    }

    console.log('License submission data:', { firstName, lastName, email: normalizedEmail, mobile: !!mobile, isLocal });

    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
      console.error('KEYMINT_API_KEY is not defined');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
    }

    const expiryDate = new Date();
    const daysToExpiry = isLocal ? +AppConfig.trial.localDuration : +AppConfig.trial.abroadDuration;
    expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

    const keymintBody = {
      productId: AppConfig.keymint.productId,
      maxActivations: '2',
      newCustomer: {
        name: `${firstName} ${lastName}`,
        email: normalizedEmail,
      },
      metadata: {
        is_trial: true,
      },
      amountKeys: '1',
      expiryDate: expiryDate.toISOString(),
      format: {
        sections: 4,
        sectionLength: 5,
        separator: '-',
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        prefix: 'RARE-',
        suffix: '-BOOKS',
        case: 'upper',
      },
    };

    const response = await fetch('https://api.keymint.dev/key', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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
        userMessage = 'A trial license has already been issued for this email address.';
      } else if (response.status === 429) {
        userMessage = 'Too many requests. Please try again later.';
      }

      return new Response(
          JSON.stringify({
            message: userMessage,
            details: errorData.message || null,
            code: errorCode,
          }),
          { status: response.status }
      );
    }

    const result = await response.json();
    const licenseKey = Array.isArray(result) ? result[0]?.key : result?.key;

    if (licenseKey) {
      try {
        console.log('Attempting to send email via Resend to:', normalizedEmail);

        const html = await render(
            React.createElement(TrialLicenseEmail, {
              firstName: firstName,
              licenseKey: licenseKey,
              expiryDate: expiryDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              storeUrl: AppConfig.storeUrl,
              isLocal: isLocal,
            })
        );

        await resend.emails.send({
          from: 'Charles | RareBooks <support@rarebooks.cc>',
          to: normalizedEmail,
          subject: 'Your Trial License Key',
          html,
        });
      } catch (emailError) {
        console.error('Error sending email with Resend:', emailError);
      }

      // Save to Cloudflare D1
      try {
        const db = env.DB;

        if (db) {
          await db
              .prepare(
                  'INSERT INTO trials (first_name, last_name, email, mobile, expiry_date, license_key, subscription_amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
              )
              .bind(
                  firstName,
                  lastName,
                  normalizedEmail,
                  mobile || null,
                  expiryDate.toISOString(),
                  licenseKey,
                  0
              )
              .run();
        } else {
          console.error('D1 Database binding (DB) not found in env. Available env keys:', Object.keys(env));
        }
      } catch (dbError: any) {
        console.error('Error saving to D1 database:', {
          message: dbError.message,
          cause: dbError.cause,
          stack: dbError.stack,
        });
      }
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in license API route:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true, env: Object.keys(env)  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};