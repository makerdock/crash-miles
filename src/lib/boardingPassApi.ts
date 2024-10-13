// app/lib/boardingPassApi.ts
'use server'
import { ethers } from 'ethers';

// Define types for the API response
export interface BoardingPassResponse {
    data: {
        passengerName: string;
        passengerFirstName: string;
        passengerLastName: string;
        legs: Array<{
            operatingCarrierPNR: string;
            departureAirport: string;
            arrivalAirport: string;
            operatingCarrierDesignator: string;
            flightNumber: string;
            flightDate: string;
            compartmentCode: string;
            seatNumber: string;
            checkInSequenceNumber: string;
            passengerStatus: string;
            airlineNumericCode: string;
            serialNumber: string;
            selecteeIndicator: string;
            internationalDocumentationVerification: string | null;
            marketingCarrierDesignator: string;
            frequentFlyerAirlineDesignator: string;
            frequentFlyerNumber: string;
            idIndicator: string | null;
            freeBaggageAllowance: string | null;
            fastTrack: string | null;
            airlineInfo: string;
        }>;
    };
    meta: {
        formatCode: string;
        numberOfLegs: number;
        electronicTicketIndicator: string;
        versionNumberIndicator: string;
        versionNumber: number;
        securityDataIndicator: string;
    };
}

export async function getBoardingPassData(boardingPassCode: string): Promise<BoardingPassResponse> {
    const url = 'https://boarding-pass-tools.p.rapidapi.com/';
    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY!,
            'x-rapidapi-host': 'boarding-pass-tools.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: boardingPassCode })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result as BoardingPassResponse;
    } catch (error) {
        console.error('Error fetching boarding pass data:', error);
        throw error;
    }
}
