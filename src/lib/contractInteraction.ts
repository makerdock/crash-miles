// app/lib/contractInteractions.ts

import { ethers } from 'ethers';

// Replace with your contract's ABI
const CONTRACT_ABI = [
    "function addProof(address user, bytes32 proofHash, bytes32 signalHash)",
    "function addTrip(address user, uint256 startTime, uint256 endTime, uint256 miles, bytes32 departureAirport, bytes32 arrivalAirport)",
    "function getProof(address user) view returns (bytes32, bytes32, uint256)",
    "function getTripCount(address user) view returns (uint256)",
    "function getTrip(address user, uint256 index) view returns (uint256, uint256, uint256, bytes32, bytes32)",
    "function getTotalMiles(address user) view returns (uint256)"
];

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

class ContractInteraction {
    private contract: ethers.Contract | null = null;
    private signer: ethers.Signer | null = null;

    async connect() {
        if (typeof (window as any).ethereum !== 'undefined') {
            try {
                // Request account access
                await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider((window as any).ethereum);
                this.signer = provider.getSigner();
                this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
            } catch (error) {
                console.error("Failed to connect to Ethereum:", error);
                throw error;
            }
        } else {
            throw new Error("Ethereum provider not found");
        }
    }

    async addProof(userAddress: string, proofHash: string, signalHash: string) {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const tx = await this.contract.addProof(userAddress, proofHash, signalHash);
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
        arrivalAirport: string
    ) {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const tx = await this.contract.addTrip(
                userAddress,
                startTime,
                endTime,
                miles,
                ethers.utils.formatBytes32String(departureAirport),
                ethers.utils.formatBytes32String(arrivalAirport)
            );
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error("Failed to add trip:", error);
            throw error;
        }
    }

    async getProof(userAddress: string) {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const [proofHash, signalHash, timestamp] = await this.contract.getProof(userAddress);
            return { proofHash, signalHash, timestamp: timestamp.toNumber() };
        } catch (error) {
            console.error("Failed to get proof:", error);
            throw error;
        }
    }

    async getTripCount(userAddress: string): Promise<number> {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const count = await this.contract.getTripCount(userAddress);
            return count.toNumber();
        } catch (error) {
            console.error("Failed to get trip count:", error);
            throw error;
        }
    }

    async getTrip(userAddress: string, index: number) {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const [startTime, endTime, miles, departureAirport, arrivalAirport] = await this.contract.getTrip(userAddress, index);
            return {
                startTime: startTime.toNumber(),
                endTime: endTime.toNumber(),
                miles: miles.toNumber(),
                departureAirport: ethers.utils.parseBytes32String(departureAirport),
                arrivalAirport: ethers.utils.parseBytes32String(arrivalAirport)
            };
        } catch (error) {
            console.error("Failed to get trip:", error);
            throw error;
        }
    }

    async getTotalMiles(userAddress: string): Promise<number> {
        if (!this.contract) {
            throw new Error("Contract not initialized");
        }
        try {
            const miles = await this.contract.getTotalMiles(userAddress);
            return miles.toNumber();
        } catch (error) {
            console.error("Failed to get total miles:", error);
            throw error;
        }
    }
}

export const contractInteraction = new ContractInteraction();