// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock available time slots (you can modify these as needed)
const availableSlots = [
  // Add time slots that should be considered "available"
  // Format: "YYYY-MM-DDTHH:mm"
];

export const mockBookingService = {
  async createBooking(bookingData) {
    // Simulate API call delay
    await delay(1500);

    // Simulate success response
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...bookingData,
      status: "confirmed",
      confirmationNumber: Math.random().toString(36).toUpperCase().substr(2, 6),
      createdAt: new Date().toISOString(),
    };
  },

  async validateSlot(dateTime) {
    await delay(500);

    // For development, consider all future dates as available
    const selectedDate = new Date(dateTime);
    const now = new Date();

    return {
      isAvailable: selectedDate > now,
      message:
        selectedDate <= now
          ? "Please select a future date and time"
          : "Time slot available",
    };
  },
};
