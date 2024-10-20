import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { CONTRACT_ABI } from './contractABI';
import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = "0x77eb8C27B70087636FBeCC618b1f9298a4A6D862";

export const useContractInteraction = () => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async () => {
    if (walletClient) {
      setIsConnected(true);
    } else {
      throw new Error("Wallet not connected");
    }
  }, [walletClient]);

  const addProof = useCallback(async (userAddress: string, proofHash: string, signalHash: string) => {
    if (!walletClient) throw new Error("Wallet not connected");
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addProof',
        args: [userAddress, proofHash, signalHash],
      });
      return hash;
    } catch (error) {
      console.error("Failed to add proof:", error);
      throw error;
    }
  }, [walletClient]);

  const addTrip = useCallback(async (
    userAddress: string,
    startTime: number,
    endTime: number,
    miles: number,
    departureAirport: string,
    arrivalAirport: string,
    flightNumber: string
  ) => {
    if (!walletClient) throw new Error("Wallet not connected");
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addTrip',
        args: [
          userAddress,
          BigInt(startTime),
          BigInt(endTime),
          miles,
          ethers.utils.formatBytes32String(departureAirport),
          ethers.utils.formatBytes32String(arrivalAirport),
          ethers.utils.formatBytes32String(flightNumber),
        ],
      });
      return hash;
    } catch (error) {
      console.error("Failed to add trip:", error);
      throw error;
    }
  }, [walletClient]);

  const getProof = useCallback(async (userAddress: string) => {
    try {
      const result = await publicClient?.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getProof',
        args: [userAddress],
      });
      const [proofHash, signalHash, timestamp] = result as [string, string, bigint];
      return { proofHash, signalHash, timestamp: Number(timestamp) };
    } catch (error) {
      console.error("Failed to get proof:", error);
      throw error;
    }
  }, [publicClient]);

  const getTripCount = useCallback(async (userAddress: string): Promise<number> => {
    try {
      const result = await publicClient?.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTripCount',
        args: [userAddress],
      });
      return Number(result);
    } catch (error) {
      console.error("Failed to get trip count:", error);
      throw error;
    }
  }, [publicClient]);

  const getTrip = useCallback(async (userAddress: string, index: number) => {
    try {
      const result = await publicClient?.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTrip',
        args: [userAddress, index],
      });
      const [startTime, endTime, miles, departureAirport, arrivalAirport, flightNumber] = result as [bigint, bigint, bigint, string, string, string];
      return {
        startTime: Number(startTime),
        endTime: Number(endTime),
        miles: Number(miles),
        departureAirport: ethers.utils.parseBytes32String(departureAirport),
        arrivalAirport: ethers.utils.parseBytes32String(arrivalAirport),
        flightNumber: ethers.utils.parseBytes32String(flightNumber),
      };
    } catch (error) {
      console.error("Failed to get trip:", error);
      throw error;
    }
  }, [publicClient]);

  const getTotalMiles = useCallback(async (userAddress: string): Promise<number> => {
    try {
      const result = await publicClient?.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTotalMiles',
        args: [userAddress],
      });
      return Number(result);
    } catch (error) {
      console.error("Failed to get total miles:", error);
      throw error;
    }
  }, [publicClient]);

  const isUserRegistered = useCallback(async (userAddress: string): Promise<boolean> => {
    try {
      return await publicClient?.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'isUserRegistered',
        args: [userAddress],
      }) as boolean;
    } catch (error) {
      console.error("Failed to check user registration:", error);
      throw error;
    }
  }, [publicClient]);

  return {
    isConnected,
    connect,
    addProof,
    addTrip,
    getProof,
    getTripCount,
    getTrip,
    getTotalMiles,
    isUserRegistered,
  };
};