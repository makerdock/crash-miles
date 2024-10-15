// Initialize the database
export async function initializeDatabase() {
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_URL ??
        "http://localhost:3000" + "/api/db/initiate"
    );
    const data: any = await res.json();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

initializeDatabase();

export type Trip = {
  userAddress: string;
  arrivalAirport: string;
  departureAirport: string;
  date:string;
  flightNumber: string;
  miles: number;
};

export type TripResponse = Trip & {
  id: number;
};

// Function to add a new trip
export async function addTrip(trip: Trip): Promise<TripResponse> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_URL ??
        "http://localhost:3000" + "/api/db/addTrip",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trip),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TripResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding trip:", error);
    throw error;
  }
}

// Function to get trips for a user
export async function getTripsForUser(
  userAddress: string
): Promise<TripResponse[]> {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_URL ??
        "http://localhost:3000" +
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

    const data: TripResponse[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting trips:", error);
    throw error;
  }
}
