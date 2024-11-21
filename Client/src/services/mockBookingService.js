import { services } from "../constants";

// Mock database for demonstration
let bookings = [];

export const mockBookingService = {
  async createBooking(bookingData) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate unique booking ID
    const bookingId = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Get service details from the services object
    const selectedService = services[bookingData.serviceType]?.find(
      (s) => s.id === bookingData.serviceId
    );

    // Format the datetime properly
    const formattedDateTime = bookingData.dateTime;

    const booking = {
      id: bookingId,
      ...bookingData,
      dateTime: formattedDateTime, // Use the formatted datetime
      service: selectedService,
      status: "confirmed",
      confirmationNumber: `BK-${bookingId}`,
      createdAt: new Date().toISOString(),
      estimatedDuration: selectedService?.duration || "1 hour",
      price: selectedService?.price || "0",
    };

    console.log("Created booking:", booking);

    // In a real app, this would be a database call
    bookings.push(booking);

    return booking;
  },

  async validateSlot(dateTime) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Parse the datetime string
      const [datePart] = dateTime.split(" ");
      const selectedDate = new Date(datePart);
      const now = new Date();

      // Check if slot is already booked
      const isSlotTaken = bookings.some(
        (booking) => booking.dateTime === dateTime
      );

      return {
        isAvailable: selectedDate > now && !isSlotTaken,
        message: isSlotTaken
          ? "This time slot is already booked"
          : selectedDate <= now
          ? "Please select a future date and time"
          : "Time slot available",
      };
    } catch (error) {
      console.error("Date validation error:", error);
      return {
        isAvailable: false,
        message: "Invalid date/time selection",
      };
    }
  },

  async getBooking(bookingId) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return bookings.find((booking) => booking.id === bookingId);
  },
};
