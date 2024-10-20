'use server'

import { PrismaClient } from '@prisma/client'
import { calculateMiles } from './calculateMiles';

const prisma = new PrismaClient()

export interface TripInput {
    userAddress: string;
    arrivalAirport: string;
    departureAirport: string;
    date: string;
    pnr: string;
    flightNumber: string;
    miles: number;
    txnHash: string;
}

export async function insertTrip(data: TripInput) {
    console.log("🚀 ~ insertTrip ~ data:", data)

    try {
        const miles = await calculateMiles({ legs: [data] })
        const trip = await prisma.trip.create({
            data: {
                useraddress: data.userAddress,
                arrivalairport: data.arrivalAirport,
                departureairport: data.departureAirport,
                startTime: data.date,
                flightnumber: data.flightNumber,
                miles: miles,
                pnr: data.pnr,
                txnhash: data.txnHash
            },
        })

        console.log(`New trip inserted with ID: ${trip.id}`)
        return { success: true, id: trip.id };
    } catch (error) {
        console.error("Failed to insert trip:", error)
        return { success: false, error: (error as Error).message };
    } finally {
        await prisma.$disconnect()
    }
}