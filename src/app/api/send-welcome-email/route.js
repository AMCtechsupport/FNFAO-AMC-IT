import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { firstName, lastName, email } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome – Your Account Has Been Created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;">Welcome, ${firstName}!</h1>
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              An account has been created for you. Here are your details:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; color: #888888; font-size: 14px; width: 40%;">First Name</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${firstName}</td>
              </tr>
              <tr style="border-top: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Last Name</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${lastName}</td>
              </tr>
              <tr style="border-top: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Email</td>
                <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${email}</td>
              </tr>
            </table>

            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Click the button below to go to the app and sign in using this email address.
            </p>

            <a
              href="${appUrl}"
              style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600;"
            >
              Go to App &rarr;
            </a>

            <p style="color: #aaaaaa; font-size: 13px; margin-top: 40px;">
              If you did not expect this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Send welcome email error:", err);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
