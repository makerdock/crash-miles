'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TripInput {
    userAddress: string;
    arrivalAirport: string;
    departureAirport: string;
    date: string;
    pnr: string;
    flightNumber: string;
    miles: number;
}

export async function insertTrip(data: TripInput) {
    try {
        const trip = await prisma.trip.create({
            data: {
                useraddress: data.userAddress,
                arrivalairport: data.arrivalAirport,
                departureairport: data.departureAirport,
                startTime: new Date(data.date), // Convert string to Date object
                flightnumber: data.flightNumber,
                miles: data.miles,
                pnr: data.pnr
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