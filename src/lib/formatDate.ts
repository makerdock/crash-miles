export const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Use the browser's locale
    const locale = navigator.language;

    // For dates within the last week, use relative time
    if (diffDays < 7) {
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diffDays, 'day');
    }

    // For dates within the current year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
        return new Intl.DateTimeFormat(locale, {
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    // For older dates, show month, day, and year
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};