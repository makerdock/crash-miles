// app/lib/contractInteractions.ts
import { ethers } from "ethers";
import { readContract, writeContract } from "wagmi/actions";
import { useWagmiConfig } from "./wagmi";
import { CONTRACT_ABI } from "./contractABI";

const config = useWagmiConfig();
export const CONTRACT_ADDRESS = "0xc1d0ff567399b16deab4ef337fc9c9ef678e4840";

class ContractInteraction {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async connect() {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        this.signer = provider.getSigner();
        this.contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.signer
        );
        console.log(
          ":rocket: ~ ContractInteraction ~ connect ~ this.contract:",
          this.contract
        );
      } catch (error) {
        console.error("Failed to connect to Ethereum:", error);
        throw error;
      }
    } else {
      throw new Error("Ethereum provider not found");
    }
  }

  async addProof(userAddress: string, proofHash: string, signalHash: string) {
    try {
      const tx = (await writeContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "addProof",
        args: [userAddress, proofHash, signalHash],
      })) as any;

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to add proof:", error);
      throw error;
    }
  }

  async addTrip(
    userAddress: string,
    startTime: number,
    endTime: number,
    miles: number,
    departureAirport: string,
    arrivalAirport: string,
    flightNumber: string
  ) {
    try {
      const tx = (await writeContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "addTrip",
        args: [
          userAddress,
          startTime,
          endTime,
          miles,
          ethers.utils.formatBytes32String(departureAirport),
          ethers.utils.formatBytes32String(arrivalAirport),
          ethers.utils.formatBytes32String(flightNumber),
        ],
      })) as any;

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to add trip:", error);
      throw error;
    }
  }

  async getProof(userAddress: string) {
    try {
      const [proofHash, signalHash, timestamp] = (await readContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "getProof",
        args: [userAddress],
      })) as any;

      return { proofHash, signalHash, timestamp: timestamp.toNumber() };
    } catch (error) {
      console.error("Failed to get proof:", error);
      throw error;
    }
  }

  async getTripCount(userAddress: string): Promise<number> {
    try {
      const count = (await readContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "getTripCount",
        args: [userAddress],
      })) as any;

      return count.toNumber();
    } catch (error) {
      console.error("Failed to get trip count:", error);
      throw error;
    }
  }

  async getTrip(userAddress: string, index: number) {
    try {
      const [
        startTime,
        endTime,
        miles,
        departureAirport,
        arrivalAirport,
        flightNumber,
      ] = (await readContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "getTrip",
        args: [userAddress, index],
      })) as any;

      return {
        startTime: startTime.toNumber(),
        endTime: endTime.toNumber(),
        miles: miles.toNumber(),
        departureAirport: ethers.utils.parseBytes32String(departureAirport),
        arrivalAirport: ethers.utils.parseBytes32String(arrivalAirport),
        flightNumber: ethers.utils.parseBytes32String(flightNumber),
      };
    } catch (error) {
      console.error("Failed to get trip:", error);
      throw error;
    }
  }

  async getTotalMiles(userAddress: string): Promise<number> {
    try {
      const miles = (await readContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "getTotalMiles",
        args: [userAddress],
      })) as any;

      return miles.toNumber();
    } catch (error) {
      console.error("Failed to get total miles:", error);
      throw error;
    }
  }

  async isUserRegistered(userAddress: string): Promise<boolean> {
    try {
      return (await readContract(config, {
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "isUserRegistered",
        args: [userAddress],
      })) as any;
    } catch (error) {
      console.error("Failed to check user registration:", error);
      throw error;
    }
  }
}

export const contractInteraction = new ContractInteraction();
