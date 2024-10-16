import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

type Trip = {
  id: number;
  userAddress: string;
  arrivalAirport: string;
  departureAirport: string;
  endTime: number;
  startTime: number;
  flightNumber: string;
  miles: number;
};

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
    const result = await sql<Trip>`
      SELECT * FROM Trip 
      WHERE userAddress = ${userAddress} 
      ORDER BY startTime DESC;
    `;

    return new NextResponse(JSON.stringify(result.rows), {
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