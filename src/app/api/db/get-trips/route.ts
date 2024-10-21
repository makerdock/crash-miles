import { db } from "@/server/db";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userAddress = searchParams.get('userAddress');

  if (!userAddress) {
    return new NextResponse(JSON.stringify({ error: "userAddress is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const trips = await db.trip.findMany({
      where: {
        useraddress: userAddress,
      },
    });

    return NextResponse.json({ trips }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error retrieving trips:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to retrieve trips" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}