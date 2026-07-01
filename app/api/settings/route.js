import { NextResponse } from 'next/server';
import clientPromise from '../../lib/db'; // Corrected import path

export async function GET() {
  const client = await clientPromise;
  const db = client.db("editgenlx");
  const settings = await db.collection("settings").findOne({ key: "pricing_plans" });
  return NextResponse.json(settings ? settings.data : []);
}

export async function POST(req) {
  const { data } = await req.json();
  const client = await clientPromise;
  const db = client.db("editgenlx");
  
  await db.collection("settings").updateOne(
    { key: "pricing_plans" },
    { $set: { data } },
    { upsert: true }
  );
  return NextResponse.json({ success: true });
}