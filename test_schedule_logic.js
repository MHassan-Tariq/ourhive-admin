const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return { hours, minutes };
};

const test = (timeStr, endTimeStr, nowStr, dateStr) => {
  const now = new Date(nowStr);
  const slotDate = new Date(dateStr);
  const startTimeParsed = parseTime(timeStr);
  const endTimeParsed = parseTime(endTimeStr);

  if (startTimeParsed && endTimeParsed) {
    const openTime = new Date(slotDate);
    openTime.setHours(startTimeParsed.hours, startTimeParsed.minutes, 0, 0);

    let closeTime = new Date(slotDate);
    closeTime.setHours(endTimeParsed.hours, endTimeParsed.minutes, 0, 0);

    if (closeTime <= openTime) {
      closeTime.setDate(closeTime.getDate() + 1);
    }

    const isOpenNow = now >= openTime && now <= closeTime;
    const closesInMinutes = isOpenNow ? Math.round((closeTime - now) / 60000) : null;

    console.log(`Test: ${timeStr} - ${endTimeStr} | Now: ${nowStr}`);
    console.log(`Open: ${openTime.toISOString()}`);
    console.log(`Close: ${closeTime.toISOString()}`);
    console.log(`isOpenNow: ${isOpenNow}, closesInMinutes: ${closesInMinutes}`);
    console.log('---');
  } else {
    console.log(`Failed to parse: ${timeStr} or ${endTimeStr}`);
  }
};

// Current time: 2026-02-28T16:25:33+05:00
const now = '2026-02-28T11:25:33.000Z'; // UTC adjusted for +5:00
const today = '2026-02-28T00:00:00.000Z';

test('10:00 AM', '6:00 PM', now, today);
test('6:00 PM', '10:00 PM', now, today);
test('2:00 PM', '4:20 PM', now, today); // Just closed
test('4:30 PM', '5:00 PM', now, today); // Not yet open
test('4:00 PM', '5:00 PM', now, today); // Open!
test('6:06 PM', '6:06 PM', now, today); // Wrap around case (24h)
