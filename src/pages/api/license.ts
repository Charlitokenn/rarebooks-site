import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { firstName, lastName, email, mobile } = data;

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
    }

    const apiKey = import.meta.env.KEYMINT_API_KEY;
    if (!apiKey) {
      console.error('KEYMINT_API_KEY is not defined');
      return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14);

    const keymintBody = {
      productId: "5dc2d14443ace8f4dcf212",
      maxActivations: "1",
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
      console.error('KeyMint API error:', errorData);
      return new Response(JSON.stringify({ message: 'Failed to generate license key' }), { status: response.status });
    }

    const result = await response.json();
    const licenseKey = result[0]?.key; // KeyMint usually returns an array of keys

    if (licenseKey) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Your Trial License Key',
          html: `
            <h1>Hello ${firstName},</h1>
            <p>Thank you for requesting a trial license for our application.</p>
            <p>Your 14-day trial license key is: <strong>${licenseKey}</strong></p>
            <p>You can download the app from the Microsoft Store and use this key to activate it.</p>
            <p>Best regards,<br/>The Team</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending email with Resend:', emailError);
        // We don't necessarily want to fail the whole request if the email fails, 
        // but we should probably log it. The user already has the key in the response result.
      }

      // Save to Cloudflare D1
      try {
        const db = locals.runtime?.env?.DB;
        if (db) {
          await db.prepare(
            'INSERT INTO trials (first_name, last_name, email, mobile, expiry_date, license_key) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(
            firstName,
            lastName,
            email,
            mobile || null,
            expiryDate.toISOString(),
            licenseKey
          ).run();
        } else {
          console.error('D1 Database binding (DB) not found in locals.runtime.env');
        }
      } catch (dbError) {
        console.error('Error saving to D1 database:', dbError);
        // Again, don't fail the whole request if saving to DB fails, but log it.
      }
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error in license API route:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
