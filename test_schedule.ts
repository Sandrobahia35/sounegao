
import { getAvailableSlots } from './services/scheduleService';

// Robson ID from previous logs
const BARBER_ID = '3a1fcf8e-bf98-439f-a41a-891a70b34016';

async function test() {
    console.log('Testing Schedule for Barber:', BARBER_ID);

    // Test Weekday (Monday)
    // Find a Monday. Dec 29 2025 is Monday? 
    // Dec 27 2025 is Saturday.
    // Dec 28 2025 is Sunday.
    // Dec 29 2025 is Monday.

    const monday = new Date('2025-12-29T12:00:00');
    console.log('Testing Monday:', monday.toISOString());
    const slotsMon = await getAvailableSlots(BARBER_ID, monday);
    console.log('Monday Slots:', slotsMon.length > 0 ? slotsMon.slice(0, 5) + '...' : 'NONE');

    // Test Sunday (Should be 09-13 default)
    const sunday = new Date('2025-12-28T12:00:00');
    console.log('Testing Sunday:', sunday.toISOString());
    const slotsSun = await getAvailableSlots(BARBER_ID, sunday);
    console.log('Sunday Slots:', slotsSun.length > 0 ? slotsSun.slice(0, 5) + '...' : 'NONE');

    // Test Saturday (Should be closed default)
    const saturday = new Date('2025-12-27T12:00:00');
    console.log('Testing Saturday:', saturday.toISOString());
    const slotsSat = await getAvailableSlots(BARBER_ID, saturday);
    console.log('Saturday Slots:', slotsSat.length > 0 ? slotsSat.slice(0, 5) + '...' : 'NONE');
}

test();
