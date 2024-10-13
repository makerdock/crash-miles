import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BoardingPassResponse } from "./boardingPassApi";
import { ethers } from "ethers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function prepareBoardingPassInput(boardingPassData: BoardingPassResponse): string {
  const { passengerName, legs } = boardingPassData.data;
  const { departureAirport, arrivalAirport, flightNumber, flightDate } = legs[0];

  // Combine relevant data into a single string
  const inputString = `${passengerName}|${departureAirport}|${arrivalAirport}|${flightNumber}|${flightDate}`;

  // Hash the input string to create a fixed-length input for ZK proof
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(inputString));
}

export function extractTripDetails(boardingPassData: BoardingPassResponse) {
  const { legs } = boardingPassData.data;
  const { departureAirport, arrivalAirport, flightDate, flightNumber } = legs[0];
  
  return {
    departureAirport,
    arrivalAirport,
    flightDate,
      flightNumber
  };
}

export const convertToValidArg = (name:string) =>{
  
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
}