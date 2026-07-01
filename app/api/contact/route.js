import { NextResponse } from 'next/server';
import { MailtrapClient } from "mailtrap";

export async function POST(req) {
  try {
    const { name, email, plan, details } = await req.json();

    // Validation check: Ensure all fields are present
    if (!name || !email || !details) {
      return NextResponse.json(
        { error: "Please fill out your name, email, and message." },
        { status: 400 }
      );
    }

    // Initialize Mailtrap client
    const mailtrap = new MailtrapClient({
      token: process.env.MAILTRAP_API_KEY,
    });

    // Dispatch the email
    await mailtrap.send({
      from: { name: "EditGenlx booking Request", email: "no-reply@editgenlx.com" },
      to: [{ email: "jonathan@editgenlx.com" }],
      subject: `EditGenlx booking request from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Plan:</strong> ${plan || "N/A"}</p>
        <p><strong>Details:</strong> ${details}</p>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully!" });

  } catch (err) {
    console.error("API CONTACT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to dispatch email. Check server configuration." },
      { status: 500 }
    );
  }
}