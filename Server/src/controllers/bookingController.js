// src/controllers/bookingController.js
import Booking from "../models/bookingModel.js";
import StoreConfig from "../models/storeConfigModel.js";
import {
  sendBookingConfirmation,
  sendAdminNotification,
  sendCancellationConfirmation,
  sendStatusUpdateEmail,
} from "../services/emailService.js";
import {
  sendStatusUpdateSMS,
  sendBookingConfirmationSMS,
} from "../services/smsService.js";
import { generatePDF } from "../services/pdfService.js";
import { validateAddressAndServiceArea } from "../services/geocodingService.js";
import { calculateDistance } from "../utils/distanceCalculator.js";
import { chargeDeposit } from "../services/squarePaymentService.js";
import twilio from "twilio";
import { BusinessSettings } from "../models/businessSettingsModel.js";

// Helper function to convert BigInt values to numbers for JSON serialization
function sanitizeBookingData(booking) {
  const bookingObj = booking.toObject ? booking.toObject() : booking;
  
  // Convert any BigInt values to numbers
  const sanitized = JSON.parse(JSON.stringify(bookingObj, (key, value) => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return value;
  }));
  
  return sanitized;
}

// NEW: Address validation endpoint
export async function validateAddress(req, res) {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const result = await validateAddressAndServiceArea(address);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Address validation failed'
      });
    }

    // Determine the validation status based on result
    let status = 'valid';
    let message = '';
    
    if (!result.isValid) {
      if (result.validationStatus === 'outside_east_bay') {
        status = 'outside_east_bay';
        message = result.validationMessage || 'Address is outside our East Bay service area';
      } else if (result.validationStatus === 'outside_service_area') {
        status = 'outside_service_area';
        message = result.validationMessage || `Address is outside our ${result.serviceRadius}-mile service area`;
      } else {
        status = 'invalid';
        message = result.validationMessage || 'Invalid address';
      }
    }

    res.json({
      success: true,
      status: status,
      isValid: result.isValid,
      message: message,
      distance: result.distance,
      serviceRadius: result.serviceRadius,
      coordinates: result.coordinates,
      formattedAddress: result.formattedAddress,
      addressComponents: result.addressComponents,
      eastBayValidation: result.eastBayValidation
    });
  } catch (error) {
    console.error('Address validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during address validation'
    });
  }
}

export async function createBooking(req, res) {
  try {
    //console.log('Received booking:', req.body);

    const basePrice = parseFloat(req.body.servicePrice);
    const optionalServicesTotal = (req.body.optionalServices || []).reduce(
      (total, service) => total + parseFloat(service.price),
      0
    );

    // Get store configuration for mobile service upcharge
    const storeConfig = await StoreConfig.findOne({ isActive: true });
    const mobileUpcharge =
      storeConfig?.mobileServiceUpcharge ||
      parseFloat(process.env.MOBILE_UPCHARGE) ||
      50;

    let totalPrice = basePrice + optionalServicesTotal;
    let adjustedServicePrice = basePrice;
    let depositRequired = false;
    let depositAmount = 0;
    let distanceFromStore = 0;

    // Handle mobile service pricing and deposits
    if (req.body.serviceType === "mobile") {
      adjustedServicePrice = basePrice + mobileUpcharge;
      totalPrice = adjustedServicePrice + optionalServicesTotal;
      depositRequired = true;
      depositAmount = Math.round(totalPrice * 0.5); // 50% deposit

      // Calculate distance if coordinates provided
      if (req.body.customerAddress?.coordinates) {
        const storeLat =
          storeConfig?.address?.coordinates?.lat ||
          parseFloat(process.env.STORE_LAT) ||
          37.8044;
        const storeLng =
          storeConfig?.address?.coordinates?.lng ||
          parseFloat(process.env.STORE_LNG) ||
          -122.2712;

        distanceFromStore = calculateDistance(
          storeLat,
          storeLng,
          req.body.customerAddress.coordinates.lat,
          req.body.customerAddress.coordinates.lng
        );
      }
    }

    // Generate confirmation number
    const now = new Date();
    const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}${now.getFullYear().toString()}`;
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const confirmationNumber = `BK-${dateStr}-${random}`;

    const bookingData = {
      ...req.body,
      servicePrice: adjustedServicePrice,
      totalPrice,
      optionalServices: req.body.optionalServices || [],
      depositRequired,
      depositAmount,
      distanceFromStore,
      confirmationNumber,
    };

    // Process payment if deposit token is provided (mobile service)
    if (req.body.depositToken && depositRequired && depositAmount > 0) {
      // Validate Square configuration before attempting payment
      if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
        console.error('Square payment configuration missing:', {
          hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
          hasLocationId: !!process.env.SQUARE_LOCATION_ID,
          environment: process.env.NODE_ENV
        });
        return res.status(500).json({
          success: false,
          error: 'Payment system configuration error. Please contact support.',
          bookingNotCreated: true
        });
      }
      
      try {
        const depositAmountCents = Math.round(depositAmount * 100); // Convert dollars to cents
        console.log(`Processing deposit payment: $${depositAmount} (${depositAmountCents} cents) for booking ${confirmationNumber}`);
        console.log('Payment details:', {
          sourceId: req.body.depositToken?.substring(0, 20) + '...',
          amount: depositAmountCents,
          customerName: req.body.name,
          customerEmail: req.body.email
        });
        
        const paymentResult = await chargeDeposit({
          sourceId: req.body.depositToken,
          amount: depositAmountCents, // Amount in cents
          currency: 'USD',
          note: `Mobile service deposit for booking ${confirmationNumber} - Customer: ${req.body.name}`,
          referenceId: confirmationNumber,
          autocomplete: true
        });

        console.log('✅ Payment processed successfully:', {
          paymentId: paymentResult.id,
          status: paymentResult.status,
          amountCents: Number(paymentResult.amountMoney?.amount || 0),
          currency: paymentResult.amountMoney?.currency,
          confirmationNumber
        });

        // Add payment information to booking data (convert BigInt values to numbers)
        bookingData.paymentDetails = {
          paymentId: paymentResult.id,
          status: paymentResult.status,
          amountCharged: depositAmount,
          processedAt: new Date(),
          cardDetails: paymentResult.cardDetails || {},
          squareAmountMoney: {
            amount: Number(paymentResult.amountMoney?.amount || 0),
            currency: paymentResult.amountMoney?.currency || 'USD'
          }
        };
        bookingData.depositPaid = true;
        
      } catch (paymentError) {
        console.error('Payment processing failed:', {
          error: paymentError.message,
          confirmationNumber,
          depositToken: req.body.depositToken?.substring(0, 10) + '...',
          amount: depositAmount
        });
        
        return res.status(400).json({
          success: false,
          error: 'Payment processing failed: ' + paymentError.message,
          bookingNotCreated: true
        });
      }
    }

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    console.log('✅ Booking created successfully:', {
      confirmationNumber: savedBooking.confirmationNumber,
      serviceType: savedBooking.serviceType,
      totalPrice: savedBooking.totalPrice,
      depositRequired: savedBooking.depositRequired,
      depositAmount: savedBooking.depositAmount,
      depositPaid: savedBooking.depositPaid,
      paymentProcessed: !!savedBooking.paymentDetails,
      customerId: savedBooking._id
    });

    //send admin notification
    try {
      await sendAdminNotification(savedBooking);
    } catch (emailError) {
      // Log the error but don't fail the booking creation
      console.error("Failed to send admin notification:", emailError);
    }

    // Send booking confirmation SMS to customer
    if (savedBooking.contact) {
      try {
        await sendBookingConfirmationSMS(savedBooking);
      } catch (smsError) {
        // Log the error but don't fail the booking creation
        console.error("Failed to send booking confirmation SMS:", smsError);
      }
    }

    res.status(201).json({
      success: true,
      data: sanitizeBookingData(savedBooking),
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}


export async function getAllBookings(req, res) {
  try {
    const { page, limit, status, search, startDate, endDate, sort } = req.query;
    if (process.env.NODE_ENV === "development") {
      console.log("getAllBookings called with sort:", sort);
      console.log(
        "Testing todays bookings sort - checking current implementation"
      );
    }

    // Backward compatibility: if no page is provided, return full list as before
    if (!page) {
      const bookings = await Booking.find()
        .sort({ createdAt: -1 })
        .select("-__v")
        .lean();

      return res.json({
        success: true,
        data: bookings,
      });
    }

    // Server-side pagination + filtering when page is provided
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      const rx = new RegExp(search, "i");
      query.$or = [
        { name: rx },
        { contact: rx },
        { confirmationNumber: rx },
        { email: rx },
      ];
    }
    // Use createdAt for date range filters (dateTime is a string field)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        query.createdAt = { $gte: start, $lte: end };
      }
    }

    const skip = (pageNum - 1) * pageSize;

    // Determine sorting method and direction
    let sortByAppointmentDate = false;
    let appointmentSortDirection = 1; // 1 for ascending, -1 for descending
    let normalizedSort = "-createdAt"; // default

    if (sort === "appointmentDate" || sort === "dateTime") {
      sortByAppointmentDate = true;
      appointmentSortDirection = 1; // ascending by default for appointment date
      normalizedSort = "appointmentDate";
    } else if (sort === "-appointmentDate" || sort === "-dateTime") {
      sortByAppointmentDate = true;
      appointmentSortDirection = -1; // descending
      normalizedSort = "-appointmentDate";
    } else if (sort === "createdAt") {
      normalizedSort = "createdAt";
    } else if (sort === "-createdAt") {
      normalizedSort = "-createdAt";
    }

    const sortObj = normalizedSort.startsWith("-")
      ? { [normalizedSort.slice(1)]: -1 }
      : { [normalizedSort]: 1 };

    // Compute LA date-only string to identify appointments scheduled "today"
    // Get current Pacific Time using proper timezone conversion
    const pacificNow = new Date();
    const laDatePart = pacificNow.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const todayRegex = new RegExp(`^${laDatePart}`);

    if (process.env.NODE_ENV === "development") {
      console.log("Pacific Time today pattern:", laDatePart);
      console.log("Today regex:", todayRegex);
    }

    // Build aggregation pipeline stages
    const matchStage = { $match: query };
    const addFieldsStage = {
      $addFields: {
        _isToday: { $regexMatch: { input: "$dateTime", regex: todayRegex } },
        // Add parsed appointment date for sorting if needed
        ...(sortByAppointmentDate && {
          _parsedAppointmentDate: {
            $dateFromString: {
              dateString: {
                $let: {
                  vars: {
                    dateParts: { $split: ["$dateTime", ", "] },
                  },
                  in: {
                    $let: {
                      vars: {
                        weekday: { $arrayElemAt: ["$$dateParts", 0] },
                        month: { $arrayElemAt: ["$$dateParts", 1] },
                        day: { $arrayElemAt: ["$$dateParts", 2] },
                        year: { $arrayElemAt: ["$$dateParts", 3] },
                        timeStr: { $arrayElemAt: ["$$dateParts", 4] },
                      },
                      in: {
                        $concat: [
                          "$$year",
                          "-",
                          {
                            $switch: {
                              branches: [
                                {
                                  case: { $eq: ["$$month", "Jan"] },
                                  then: "01",
                                },
                                {
                                  case: { $eq: ["$$month", "Feb"] },
                                  then: "02",
                                },
                                {
                                  case: { $eq: ["$$month", "Mar"] },
                                  then: "03",
                                },
                                {
                                  case: { $eq: ["$$month", "Apr"] },
                                  then: "04",
                                },
                                {
                                  case: { $eq: ["$$month", "May"] },
                                  then: "05",
                                },
                                {
                                  case: { $eq: ["$$month", "Jun"] },
                                  then: "06",
                                },
                                {
                                  case: { $eq: ["$$month", "Jul"] },
                                  then: "07",
                                },
                                {
                                  case: { $eq: ["$$month", "Aug"] },
                                  then: "08",
                                },
                                {
                                  case: { $eq: ["$$month", "Sep"] },
                                  then: "09",
                                },
                                {
                                  case: { $eq: ["$$month", "Oct"] },
                                  then: "10",
                                },
                                {
                                  case: { $eq: ["$$month", "Nov"] },
                                  then: "11",
                                },
                                {
                                  case: { $eq: ["$$month", "Dec"] },
                                  then: "12",
                                },
                              ],
                              default: "01",
                            },
                          },
                          "-",
                          {
                            $cond: {
                              if: { $lt: [{ $toInt: "$$day" }, 10] },
                              then: { $concat: ["0", "$$day"] },
                              else: "$$day",
                            },
                          },
                          "T",
                          {
                            $let: {
                              vars: {
                                timeParts: { $split: ["$$timeStr", " "] },
                              },
                              in: {
                                $let: {
                                  vars: {
                                    time: { $arrayElemAt: ["$$timeParts", 0] },
                                    ampm: { $arrayElemAt: ["$$timeParts", 1] },
                                  },
                                  in: {
                                    $let: {
                                      vars: {
                                        hourMin: { $split: ["$$time", ":"] },
                                      },
                                      in: {
                                        $let: {
                                          vars: {
                                            hour: {
                                              $toInt: {
                                                $arrayElemAt: ["$$hourMin", 0],
                                              },
                                            },
                                            minute: {
                                              $arrayElemAt: ["$$hourMin", 1],
                                            },
                                          },
                                          in: {
                                            $concat: [
                                              {
                                                $cond: {
                                                  if: { $eq: ["$$ampm", "PM"] },
                                                  then: {
                                                    $cond: {
                                                      if: {
                                                        $eq: ["$$hour", 12],
                                                      },
                                                      then: "12",
                                                      else: {
                                                        $let: {
                                                          vars: {
                                                            h24: {
                                                              $add: [
                                                                "$$hour",
                                                                12,
                                                              ],
                                                            },
                                                          },
                                                          in: {
                                                            $cond: {
                                                              if: {
                                                                $lt: [
                                                                  "$$h24",
                                                                  10,
                                                                ],
                                                              },
                                                              then: {
                                                                $concat: [
                                                                  "0",
                                                                  {
                                                                    $toString:
                                                                      "$$h24",
                                                                  },
                                                                ],
                                                              },
                                                              else: {
                                                                $toString:
                                                                  "$$h24",
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                  else: {
                                                    $cond: {
                                                      if: {
                                                        $eq: ["$$hour", 12],
                                                      },
                                                      then: "00",
                                                      else: {
                                                        $cond: {
                                                          if: {
                                                            $lt: ["$$hour", 10],
                                                          },
                                                          then: {
                                                            $concat: [
                                                              "0",
                                                              {
                                                                $toString:
                                                                  "$$hour",
                                                              },
                                                            ],
                                                          },
                                                          else: {
                                                            $toString: "$$hour",
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                              ":",
                                              "$$minute",
                                              ":00.000Z",
                                            ],
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
              onError: new Date("1970-01-01"),
            },
          },
        }),
      },
    };

    // Build sort stage based on sorting preference
    // ALWAYS prioritize today's bookings first, regardless of sort parameter
    let sortStage;
    if (sortByAppointmentDate) {
      sortStage = {
        $sort: {
          _isToday: -1, // Today's bookings always first
          _parsedAppointmentDate: appointmentSortDirection,
          createdAt: -1, // tertiary sort by creation date
        },
      };
    } else {
      // Traditional sorting with today's bookings first
      sortStage = { $sort: Object.assign({ _isToday: -1 }, sortObj) };
    }
    const projectStage = { $project: { __v: 0, statusHistory: 0 } };

    const [paged, total] = await Promise.all([
      Booking.aggregate([
        matchStage,
        addFieldsStage,
        sortStage,
        { $skip: skip },
        { $limit: pageSize },
        projectStage,
      ]),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: paged,
      total,
      page: pageNum,
      pageSize,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getBookingById(req, res) {
  try {
    const booking = await Booking.findById(req.params.id).select("-__v");

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note = "" } = req.body;

    // Validate the new status
    const validStatuses = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Append a new status record to the status history with Pacific Time
    booking.statusHistory.push({
      status,
      timestamp: new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
      ),
      note,
    });

    // Update the current status
    booking.status = status;

    // Save the updated booking
    await booking.save();

    // Send email notification to customer
    if (booking.email) {
      try {
        await sendStatusUpdateEmail(booking, status, note);
      } catch (emailError) {
        console.error("Failed to send status update email:", emailError);
      }
    }

    // Send SMS status update ONLY for completed or cancelled status
    // Reduces SMS costs by avoiding redundant notifications for intermediate states
    // Confirmation SMS already sent on booking creation, booking edits trigger separate SMS
    const smsEnabledStatuses = ["completed", "cancelled"];
    if (booking.contact && smsEnabledStatuses.includes(status)) {
      try {
        await sendStatusUpdateSMS(booking, status, note);
      } catch (smsError) {
        console.error("Failed to send SMS status update:", smsError);
      }
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export const generateBookingPDF = async (req, res) => {
  try {
    const { confirmationNumber } = req.params;
    const booking = await Booking.findOne({ confirmationNumber });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-${confirmationNumber}.pdf`
    );

    // Generate and pipe the PDF
    const doc = generatePDF(booking);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

export const resendBookingEmail = async (req, res) => {
  const { confirmationNumber } = req.params;
  const booking = await Booking.findOne({ confirmationNumber });

  if (!booking || !booking.email) {
    return res
      .status(404)
      .json({ error: "Booking not found or no email provided" });
  }

  const emailSent = await sendBookingConfirmation(booking);

  if (emailSent) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to send email" });
  }
};

export const checkDateAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    const businessHours = [
      "9:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
      "6:00 PM",
      "7:00 PM",
      "8:00 PM",
    ];

    const settings = await BusinessSettings.findOne();
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const maxBookingsPerSlot = 2;
    const slots = {};

    // If business is closed on this day, return all slots unavailable
    if (
      settings?.unavailableDay !== null &&
      settings?.unavailableDay !== undefined &&
      dayOfWeek === settings.unavailableDay
    ) {
      businessHours.forEach((time) => {
        slots[time] = { available: false };
      });
      return res.json({ success: true, slots });
    }

    await Promise.all(
      businessHours.map(async (time) => {
        const dateTimePattern = `^${date}, ${time}$`;

        const bookingsCount = await Booking.countDocuments({
          dateTime: { $regex: new RegExp(dateTimePattern) },
          status: { $nin: ["cancelled"] },
        });

        // Only return availability status, not counts
        slots[time] = {
          available: bookingsCount < maxBookingsPerSlot,
        };
      })
    );

    res.json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Date slots availability check error:", error);
    res.status(500).json({
      success: false,
      error: "Error checking availability",
    });
  }
};

export const checkSlotAvailability = async (req, res) => {
  try {
    const { dateTime } = req.query;

    // The dateTime comes in format: "Wed, Jan 8, 2025, 11:00 AM"
    // First, let's split the date and time
    const [datePart, timePart] = dateTime.split(", ").slice(-2);

    // Respect business unavailable day
    try {
      const settings = await BusinessSettings.findOne();
      if (
        settings?.unavailableDay !== null &&
        settings?.unavailableDay !== undefined
      ) {
        const dateOnly = new Date(dateTime.split(", ").slice(0, -1).join(", "));
        const dayOfWeek = dateOnly.getDay();
        if (dayOfWeek === settings.unavailableDay) {
          return res.json({
            success: true,
            available: false,
            currentBookings: 0,
            maxBookingsPerSlot: 2,
            requestedDateTime: dateTime,
          });
        }
      }
    } catch (_) {
      // ignore
    }

    // Create a regex pattern to match this exact date and time
    const dateTimePattern = `^${dateTime
      .split(", ")
      .slice(0, -1)
      .join(", ")}, ${timePart}$`;

    // Count bookings for this exact date and time slot
    const bookingsCount = await Booking.countDocuments({
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ["cancelled"] },
    });

    // For debugging
    // console.log("Checking availability for:", dateTime);
    // console.log("Pattern used:", dateTimePattern);
    // console.log("Bookings found:", bookingsCount);

    const maxBookingsPerSlot = 2; // You can adjust this number
    const isAvailable = bookingsCount < maxBookingsPerSlot;

    res.json({
      success: true,
      available: isAvailable,
      currentBookings: bookingsCount,
      maxBookingsPerSlot,
      requestedDateTime: dateTime,
      pattern: dateTimePattern, // Including this for debugging
    });
  } catch (error) {
    console.error("Slot availability check error:", error);
    res.status(500).json({
      success: false,
      error: "Error checking slot availability",
      details: error.message,
    });
  }
};

export const checkCancellation = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, "base64").toString();

    const booking = await Booking.findOne({
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled/completed",
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const pacificNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const hoursUntilAppointment =
      (appointmentTime - pacificNow) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error:
          "Cancellations must be made at least 24 hours before the appointment",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { confirmationNumber, email } = req.params;
    const decodedEmail = Buffer.from(email, "base64").toString();

    const booking = await Booking.findOne({
      confirmationNumber,
      email: decodedEmail,
      status: { $nin: ["cancelled", "completed"] },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled/completed",
      });
    }

    const appointmentTime = new Date(booking.dateTime);
    const now = new Date();
    const pacificNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const hoursUntilAppointment =
      (appointmentTime - pacificNow) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        error:
          "Cancellations must be made at least 24 hours before the appointment",
      });
    }

    booking.status = "cancelled";
    booking.statusHistory.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Cancelled by customer through cancellation page",
    });

    await booking.save();

    // Send cancellation confirmation emails
    try {
      await sendCancellationConfirmation(booking);
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }

    // Send cancellation confirmation SMS
    try {
      await sendStatusUpdateSMS(
        booking,
        booking.status,
        "Cancelled by customer through cancellation page"
      );
    } catch (smsError) {
      console.error("Failed to send SMS status update:", smsError);
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove immutable fields
    const immutableFields = ["confirmationNumber", "_id", "createdAt"];
    immutableFields.forEach((field) => delete updateData[field]);

    const originalBooking = await Booking.findById(id);
    if (!originalBooking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    // Preserve original values if not being updated
    const updatedData = {
      ...originalBooking.toObject(),
      ...updateData,
      totalPrice: updateData.totalPrice || originalBooking.totalPrice,
      optionalServices:
        updateData.optionalServices || originalBooking.optionalServices,
    };

    let statusNote = "";

    // Special handling for date/time changes
    if (
      updateData.dateTime &&
      updateData.dateTime !== originalBooking.dateTime
    ) {
      const slotAvailable = await checkSlotAvailabilityInternal(
        updateData.dateTime,
        id
      );
      if (!slotAvailable) {
        return res
          .status(400)
          .json({ success: false, error: "New time slot is not available" });
      }

      statusNote = `Rescheduled from ${originalBooking.dateTime} to ${updateData.dateTime}`;
      updatedData.statusHistory = [
        ...originalBooking.statusHistory,
        {
          status: "pending",
          timestamp: new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          }),
          note: statusNote,
        },
      ];
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    // Send email notification about the update
    if (updatedBooking.email) {
      try {
        await sendStatusUpdateEmail(
          updatedBooking,
          updatedBooking.status,
          statusNote || "Booking details have been updated"
        );
      } catch (emailError) {
        console.error("Failed to send update notification email:", emailError);
        // Don't fail the update if email fails
      }
    }

    // Send SMS status update
    if (updatedBooking.contact) {
      try {
        await sendStatusUpdateSMS(
          updatedBooking,
          updatedBooking.status,
          statusNote || "Booking details have been updated"
        );
      } catch (smsError) {
        console.error("Failed to send update notification SMS:", smsError);
        // Don't fail the update if SMS fails
      }
    }

    res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Helper function using existing availability logic
async function checkSlotAvailabilityInternal(dateTime, bookingId) {
  // Add bookingId parameter
  try {
    // Respect business unavailable day
    try {
      const settings = await BusinessSettings.findOne();
      if (
        settings?.unavailableDay !== null &&
        settings?.unavailableDay !== undefined
      ) {
        const dateOnly = new Date(dateTime.split(", ").slice(0, -1).join(", "));
        const dayOfWeek = dateOnly.getDay();
        if (dayOfWeek === settings.unavailableDay) {
          return false;
        }
      }
    } catch (_) {
      // ignore
    }
    const [datePart, timePart] = dateTime.split(", ").slice(-2);
    const dateTimePattern = `^${dateTime
      .split(", ")
      .slice(0, -1)
      .join(", ")}, ${timePart}$`;

    const query = {
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ["cancelled"] },
    };

    // Only exclude current booking if ID is provided
    if (bookingId) {
      query._id = { $ne: bookingId };
    }

    const bookingsCount = await Booking.countDocuments(query);
    const maxBookingsPerSlot = 2;
    return bookingsCount < maxBookingsPerSlot;
  } catch (error) {
    return false;
  }
}

export const handleSMSWebhook = async (req, res) => {
  try {
    const { Body, From, MessageSid } = req.body;

    // Log incoming message
    // console.log({
    //   event: 'sms_received',
    //   from: From,
    //   body: Body,
    //   messageId: MessageSid,
    //   timestamp: new Date().toISOString()
    // });

    // Send a basic response
    const twiml = new twilio.twiml.MessagingResponse();

    if (Body.toUpperCase() === "HELP") {
      twiml.message("For assistance, please call 4158899108.");
    } else {
      twiml.message(
        "Thank you for your message. We will get back to you shortly."
      );
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  } catch (error) {
    console.error("SMS webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
};
