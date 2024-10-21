export function adjustFlightDate(dateString: string): Date {
    // Parse the input date string
    const flightDate = new Date(dateString);

    // Get the current date
    const currentDate = new Date();

    // Calculate the date 6 months from now
    const sixMonthsFromNow = new Date(currentDate);
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6);

    // Check if the flight year is more than 6 months in the future
    if (flightDate > sixMonthsFromNow) {
        // Subtract 42 years
        flightDate.setFullYear(flightDate.getFullYear() - 42);
    }

    return flightDate;
}