import { getTripsForUser } from "@/lib/db";
import { Trip } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

interface TripsResult {
  trips: Trip[];
}


const useGetTrips = () => {
  const { address } = useAccount();

  const fetchTrips = async (): Promise<TripsResult> => {
    try {
      const trips = await getTripsForUser(address as string);
      return trips;
    } catch (error: any) {
      return { trips: [] };
    }
  };

  return useQuery<TripsResult>({
    refetchOnWindowFocus: true,
    queryKey: ["getTrips"],
    queryFn: async () => await fetchTrips(),
  });
};

export default useGetTrips;
