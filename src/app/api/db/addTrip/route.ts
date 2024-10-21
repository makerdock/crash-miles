import { Trip } from "@prisma/client";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = (await req.json()) as Trip;

  const {
    userAddress,
    arrivalAirport,
    departureAirport,
    date,
    flightNumber,
    miles,
  } = data;

  try {
    const result = await sql`
        INSERT INTO Trip (userAddress, arrivalAirport, departureAirport, flightNumber, miles, date)
        VALUES (${userAddress}, ${arrivalAirport}, ${departureAirport}, ${flightNumber}, ${miles}, ${date})
        RETURNING id;
      `;
    console.log(`New trip inserted with ID: ${result.rows[0].id}`);

    return new NextResponse(JSON.stringify(result.rows[0]), {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
