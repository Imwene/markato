import PDFDocument from "pdfkit";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, "email-logo.jpg");
const LOGO = fs.readFileSync(logoPath);

export const generatePDF = (booking) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true
  });

  const boxes = [];
  const textOperations = [];

  const addBox = (x, y, width, height, fillColor = "#ffffff") => {
    boxes.push(() => {
      doc
        .rect(x, y, width, height)
        .fillColor(fillColor)
        .strokeColor("#e5e5e5")
        .fillAndStroke();
    });
  };

  const addText = (text, x, y, options = {}) => {
    textOperations.push(() => {
      doc
        .fillColor(options.color || "#000")
        .fontSize(options.fontSize || 11)
        .text(text, x, y, options);
    });
  };

  // Logo
  doc.image(LOGO, {
    fit: [200, 50],
    align: "center",
    y: 40
  });

  // Title
  addText("Booking Confirmation", 50, 120, {
    fontSize: 18,
    align: "center",
    width: 495
  });

  // Confirmation Number Section
  const confirmY = 160;
  addBox(50, confirmY, 495, 40, "#f6f6f6");
  addText(`Confirmation Number: ${booking.confirmationNumber}`, 50, confirmY + 12, {
    fontSize: 12,
    align: "center",
    width: 495
  });

  // Information Section
  const infoY = 220;
  
  // Customer Info Box
  addBox(65, infoY, 230, 120);
  addText("Customer Information", 80, infoY + 15, { fontSize: 13, bold: true });
  addText(`Name: ${booking.name}`, 80, infoY + 40);
  addText(`Contact: ${booking.contact}`, 80, infoY + 60);
  if (booking.email) {
    addText(`Email: ${booking.email}`, 80, infoY + 80);
  }

  // Vehicle Info Box
  addBox(315, infoY, 230, 120);
  addText("Vehicle Information", 330, infoY + 15, { fontSize: 13, bold: true });
  addText(`Make/Model: ${booking.makeModel}`, 330, infoY + 40);
  addText(`Vehicle Type: ${booking.vehicleType}`, 330, infoY + 60);

  // Service Details and Optional Services Side by Side
  const serviceY = 360;
  
  // Service Details Box (Left)
  addBox(65, serviceY, 230, 120);
  addText("Service Details", 80, serviceY + 15, { fontSize: 13, bold: true });
  addText(`Service Type: ${booking.serviceName}`, 80, serviceY + 40);
  addText(`Date & Time: ${booking.dateTime}`, 80, serviceY + 60);
  addText(`Selected Scent: ${booking.selectedScent}`, 80, serviceY + 80);
  addText(`Service Price: $${booking.servicePrice}`, 80, serviceY + 100);

  // Optional Services Box (Right)
  addBox(315, serviceY, 230, 120);
  addText("Optional Services", 330, serviceY + 15, { fontSize: 13, bold: true });
  
  if (booking.optionalServices?.length > 0) {
    booking.optionalServices.forEach((service, index) => {
      addText(
        `• ${service.name}: $${service.price}`,
        330,
        serviceY + 40 + (index * 20)
      );
    });
  } else {
    addText("None", 330, serviceY + 40);
  }

  // Total Amount Section
  const totalY = 500;
  addBox(65, totalY, 480, 40, "#f6f6f6");
  addText(`Total Amount: $${booking.totalPrice}`, 65, totalY + 12, {
    fontSize: 13,
    align: "center",
    width: 480
  });

  // Cancellation Section
  const cancelY = 560;
  if (booking.email) {
    addBox(65, cancelY, 480, 60, "#f8f8f8");
    const encodedEmail = Buffer.from(booking.email).toString("base64");
    const cancellationUrl = `${process.env.FRONTEND_URL}/cancel-booking/${booking.confirmationNumber}/${encodedEmail}`;
    
    addText("Need to cancel or reschedule?", 65, cancelY + 15, {
      align: "center",
      width: 480
    });
    addText(cancellationUrl, 65, cancelY + 35, {
      align: "center",
      width: 480,
      color: "#0066cc",
      underline: true,
      link: cancellationUrl
    });
  }

  // Footer Section (fixed position at bottom)
  const footerY = 640;
  addBox(50, footerY, 495, 130, "#f8f8f8");
  
  // Footer text
  const footerContent = [
    { text: "Contact Us:", y: 15 },
    { text: "Phone: (415) 889-9108", y: 35 },
    { text: "Email: markatoautodetail@gmail.com", y: 55 },
    { text: "Location: 1901 Park Blvd, Oakland, CA 94606", y: 75 },
    { text: "Thank you for choosing Markato Auto Detailing!", y: 95},
    { text: "Please present this confirmation at the time of service.", y: 115 }
  ];

  footerContent.forEach(item => {
    addText(item.text, 50, footerY + item.y, {
      align: "center",
      width: 495,
      color: item.color || "#333"
    });
  });

  // Execute all drawing operations in correct order
  boxes.forEach(drawBox => drawBox());
  textOperations.forEach(drawText => drawText());

  return doc;
};