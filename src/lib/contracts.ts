import { Abi, ContractFunctionParameters } from "viem";
import { CONTRACT_ADDRESS } from "./contractInteraction";
import { CONTRACT_ABI } from "./contractABI";

export const getAddProofContract = ({
  userAddress,
  proofHash,
  signalHash,
}: {
  userAddress: any;
  proofHash: string;
  signalHash: string;
}) => {
  return [
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI as Abi,
      functionName: "addProof",
      args: [userAddress, proofHash, signalHash],
    },
  ] as ContractFunctionParameters[];
};

export const getAddTripContract = ({
  arrivalAirport,
  departureAirport,
  endTime,
  flightNumber,
  miles,
  startTime,
  userAddress,
}: {
  userAddress: any;
  startTime: number;
  endTime: number;
  miles: number;
  departureAirport: string;
  arrivalAirport: string;
  flightNumber: string;
}) => {
  return [
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI as Abi,
      functionName: "addTrip",
      args: [
        userAddress,
        startTime,
        endTime,
        miles,
        departureAirport,
        arrivalAirport,
        flightNumber
      ],
    },
  ] as ContractFunctionParameters[];
};
