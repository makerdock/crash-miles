import { Trip } from "@prisma/client";
import { getHost } from "./getHost";

// Function to get trips for a user
export async function getTripsForUser(
  userAddress: string
): Promise<{ trips: Trip[] }> {
  try {
    const response = await fetch(
      getHost() +
      `/api/db/get-trips?userAddress=${encodeURIComponent(userAddress)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting trips:", error);
    throw error;
  }
}
