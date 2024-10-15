import { getTripsForUser } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useAccount } from "wagmi";

const useGetTrips = () => {
  const { address } = useAccount();

  if (!address) return;

  const fetchTrips = async () => {
    try {
      const trips = await getTripsForUser(address as string);
      return trips;
    } catch (error: any) {
      return [];
    }
  };

  return useQuery({
    queryKey: ["getTrips"],
    queryFn: async () => await fetchTrips(),
  });
};

export default useGetTrips;
