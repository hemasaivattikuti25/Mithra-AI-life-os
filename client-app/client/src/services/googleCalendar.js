import axios from 'axios';

/**
 * Fetch calendar events from Google Calendar API
 * @param {string} providerToken - The OAuth provider token from Supabase session
 * @param {Date} timeMin - Start of the range
 * @param {Date} timeMax - End of the range
 */
export const listGoogleEvents = async (providerToken, timeMin, timeMax) => {
    try {
        const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            headers: {
                Authorization: `Bearer ${providerToken}`,
            },
            params: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            },
        });

        return response.data.items.map(item => ({
            id: item.id,
            title: item.summary,
            start: new Date(item.start.dateTime || item.start.date),
            end: new Date(item.end.dateTime || item.end.date), // Full day events use 'date'
            allDay: !item.start.dateTime,
            location: item.location,
            description: item.description,
            htmlLink: item.htmlLink,
            source: 'google', // To distinguish from internal events
        }));
    } catch (error) {
        console.warn('Error fetching Google Calendar events:', error);
        if (error.response?.status === 401) {
            // Token might be expired or invalid
            throw new Error('Unauthorized');
        }
        return [];
    }
};
