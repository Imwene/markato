// src/utils/dateTimeParser.js
/**
 * Robust dateTime parser for appointment dates
 * Handles the format: "Sat, Oct 11, 2025, 3:00 PM"
 * Includes multiple fallback strategies for edge cases
 */

/**
 * Parse appointment dateTime string into Date object
 * @param {string} dateTimeString - The dateTime string to parse
 * @returns {Date|null} - Parsed Date object or null if parsing fails
 */
export const parseAppointmentDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  
  try {
    // Primary method: Use existing regex fix to handle missing delimiter
    // Transforms "Sat, Oct 11, 2025, 3:00 PM" -> "Sat, Oct 11, 2025, 3:00 PM"
    const normalized = dateTimeString.replace(/, (\d)/, ' $1');
    const parsed = new Date(normalized);
    
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    // Fallback 1: Try direct parsing without regex fix
    const directParse = new Date(dateTimeString);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }
    
    // Fallback 2: Manual parsing for edge cases
    // Extract components using regex
    const dateTimeRegex = /^(\w{3}),\s+(\w{3})\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i;
    const match = dateTimeString.match(dateTimeRegex);
    
    if (match) {
      const [, weekday, month, day, year, hours, minutes, period] = match;
      
      // Convert month name to number
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const monthNum = monthMap[month];
      if (monthNum === undefined) return null;
      
      // Convert 12-hour time to 24-hour time
      let hour24 = parseInt(hours, 10);
      if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      const manualDate = new Date(
        parseInt(year, 10),
        monthNum,
        parseInt(day, 10),
        hour24,
        parseInt(minutes, 10),
        0,
        0
      );
      
      if (!isNaN(manualDate.getTime())) {
        return manualDate;
      }
    }
    
    // All parsing attempts failed
    console.warn('Failed to parse dateTime with all methods:', dateTimeString);
    return null;
    
  } catch (error) {
    console.warn('Error parsing dateTime:', dateTimeString, error);
    return null;
  }
};

/**
 * Get the most recent date from an array of dateTime strings
 * @param {string[]} dateTimeStrings - Array of dateTime strings
 * @returns {Date|null} - Most recent date or null if no valid dates
 */
export const getMostRecentAppointmentDate = (dateTimeStrings) => {
  if (!Array.isArray(dateTimeStrings) || dateTimeStrings.length === 0) {
    return null;
  }
  
  const validDates = dateTimeStrings
    .map(parseAppointmentDateTime)
    .filter(date => date !== null);
  
  if (validDates.length === 0) {
    return null;
  }
  
  return new Date(Math.max(...validDates.map(date => date.getTime())));
};

/**
 * Filter dateTime strings by booking status and get most recent
 * @param {Array} bookings - Array of booking objects with dateTime and status
 * @param {string[]} statuses - Array of statuses to include (e.g., ['completed', 'cancelled'])
 * @returns {Date|null} - Most recent date for filtered bookings or null
 */
export const getMostRecentAppointmentDateByStatus = (bookings, statuses = ['completed', 'cancelled']) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return null;
  }
  
  const filteredDateStrings = bookings
    .filter(booking => statuses.includes(booking.status))
    .map(booking => booking.dateTime)
    .filter(dateTime => dateTime);
  
  return getMostRecentAppointmentDate(filteredDateStrings);
};