'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TripInput {
    userAddress: string;
    arrivalAirport: string;
    departureAirport: string;
    date: string;
    flightNumber: string;
    miles: number;
}

export async function insertTrip(data: TripInput) {
    try {
        const trip = await prisma.trip.create({
            data: {
                userAddress: data.userAddress,
                arrivalAirport: data.arrivalAirport,
                departureAirport: data.departureAirport,
                date: new Date(data.date), // Convert string to Date object
                flightNumber: data.flightNumber,
                miles: data.miles,
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