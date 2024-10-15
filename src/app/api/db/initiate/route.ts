import { sql, db } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Check if the POSTG RES_URL environment variable is set
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL environment variable is not set");
    }
    // Create the Trip table if it doesn't exist
    await sql`
            CREATE TABLE IF NOT EXISTS Trip (
              id SERIAL PRIMARY KEY,
              userAddress VARCHAR(42) NOT NULL,
              arrivalAirport VARCHAR(255) NOT NULL,
              departureAirport VARCHAR(255) NOT NULL,
              flightNumber VARCHAR(20) NOT NULL,
              miles INTEGER NOT NULL,
              date VARCHAR(20) NOT NULL
            );
          `;
    console.log("Database initialized: Trip table created or already exists");

    await db.connect();
    return new NextResponse(JSON.stringify({ msg: "Db initialized" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
