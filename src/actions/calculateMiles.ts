// File: app/actions/calculateMiles.ts

import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

const LOCAL_CSV_FILE = path.join(process.cwd(), 'public', 'airports.csv');

interface Airport {
    name: string;
    lat: number;
    lon: number;
}

interface TravelLeg {
    departureAirport: string;
    arrivalAirport: string;
}

interface TravelData {
    legs: TravelLeg[];
}

let airportsCache: Record<string, Airport> | null = null;

async function loadAirports(): Promise<Record<string, Airport>> {
    if (airportsCache) {
        return airportsCache;
    }

    const csvData = await fs.readFile(LOCAL_CSV_FILE, 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });

    const airportsMap = new Map<string, Airport>();
    for (const row of records) {
        if (row.type === 'large_airport' || row.type === 'medium_airport') {
            airportsMap.set(row.iata_code, {
                name: row.name,
                lat: parseFloat(row.latitude_deg),
                lon: parseFloat(row.longitude_deg)
            });
        }
    }

    airportsCache = Object.fromEntries(airportsMap);
    return airportsCache;
}

async function getAirportData(iataCode: string): Promise<Airport | null> {
    const airports = await loadAirports();
    return airports[iataCode] || null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance * 0.621371; // Convert km to miles
}

export async function calculateMiles(travelData: TravelData): Promise<number> {
    let totalMiles = 0;

    for (const leg of travelData.legs) {
        const departure = await getAirportData(leg.departureAirport);
        const arrival = await getAirportData(leg.arrivalAirport);

        if (departure && arrival) {
            const miles = calculateDistance(departure.lat, departure.lon, arrival.lat, arrival.lon);
            totalMiles += miles;
        } else {
            console.warn(`Airport data missing for ${leg.departureAirport} or ${leg.arrivalAirport}`);
        }
    }

    return Math.round(totalMiles);
}