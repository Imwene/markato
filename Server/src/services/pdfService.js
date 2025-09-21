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
    bufferPages: false, // Prevent automatic page breaks
    autoFirstPage: true
  });
  
  // A4 dimensions: 595 x 842 points
  // With 50pt margins: usable area is 495 x 742 points
  const pageHeight = 742; // Usable height after margins
  let currentY = 0; // Track current vertical position

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
  currentY = 20;
  doc.image(LOGO, {
    fit: [200, 40],
    align: "center",
    y: currentY
  });
  currentY += 60;

  // Title
  addText("Booking Confirmation", 50, currentY, {
    fontSize: 18,
    align: "center",
    width: 495
  });
  currentY += 35;

  // Confirmation Number Section
  addBox(50, currentY, 495, 35, "#f6f6f6");
  addText(`Confirmation Number: ${booking.confirmationNumber}`, 50, currentY + 10, {
    fontSize: 12,
    align: "center",
    width: 495
  });
  currentY += 50;

  // Information Section - Customer and Vehicle Info Side by Side
  const boxHeight = 100; // Reduced height
  
  // Customer Info Box (Left)
  addBox(65, currentY, 230, boxHeight);
  addText("Customer Information", 80, currentY + 10, { fontSize: 12, bold: true });
  addText(`Name: ${booking.name}`, 80, currentY + 28);
  addText(`Contact: ${booking.contact}`, 80, currentY + 44);
  if (booking.email) {
    addText(`Email: ${booking.email}`, 80, currentY + 60);
  }

  // Vehicle Info Box (Right)
  addBox(315, currentY, 230, boxHeight);
  addText("Vehicle Information", 330, currentY + 10, { fontSize: 12, bold: true });
  addText(`Make/Model: ${booking.makeModel}`, 330, currentY + 28);
  addText(`Vehicle Type: ${booking.vehicleType}`, 330, currentY + 44);
  currentY += boxHeight + 15;

  // Service Details and Optional Services Side by Side
  const serviceBoxHeight = 100; // Reduced height
  
  // Service Details Box (Left)
  addBox(65, currentY, 230, serviceBoxHeight);
  addText("Service Details", 80, currentY + 10, { fontSize: 12, bold: true });
  addText(`Service: ${booking.serviceName}`, 80, currentY + 28);
  addText(`Type: ${booking.serviceType === 'mobile' ? 'Mobile Service' : 'Drive-in Service'}`, 80, currentY + 42);
  addText(`Date & Time: ${booking.dateTime}`, 80, currentY + 56, { fontSize: 10 });
  addText(`Scent: ${booking.selectedScent}`, 80, currentY + 70);
  addText(`Service Price: $${booking.servicePrice}`, 80, currentY + 84);

  // Optional Services Box (Right)
  addBox(315, currentY, 230, serviceBoxHeight);
  addText("Optional Services", 330, currentY + 10, { fontSize: 12, bold: true });
  
  if (booking.optionalServices?.length > 0) {
    booking.optionalServices.forEach((service, index) => {
      addText(
        `• ${service.name}: $${service.price}`,
        330,
        currentY + 28 + (index * 16),
        { fontSize: 10 }
      );
    });
  } else {
    addText("None", 330, currentY + 28);
  }
  currentY += serviceBoxHeight + 15;

  // Mobile Service Address Section (if applicable)
  if (booking.serviceType === 'mobile' && booking.customerAddress) {
    addBox(65, currentY, 480, 45, "#fff7ed");
    addText("Mobile Service Location", 65, currentY + 8, {
      fontSize: 12,
      align: "center",
      width: 480
    });
    const address = `${booking.customerAddress.street}, ${booking.customerAddress.city}, ${booking.customerAddress.state} ${booking.customerAddress.zipCode}`;
    addText(address, 65, currentY + 26, {
      fontSize: 10,
      align: "center",
      width: 480
    });
    currentY += 60;
  }

  // Total Amount Section
  const depositBoxHeight = booking.serviceType === 'mobile' && booking.depositRequired ? 65 : 35;
  addBox(65, currentY, 480, depositBoxHeight, "#f6f6f6");
  addText(`Total Amount: $${booking.totalPrice}`, 65, currentY + 10, {
    fontSize: 13,
    align: "center",
    width: 480
  });
  
  // Add deposit information for mobile services
  if (booking.serviceType === 'mobile' && booking.depositRequired) {
    const depositAmount = booking.depositAmount || booking.totalPrice * 0.5;
    const remainingBalance = booking.totalPrice - depositAmount;
    addText(`Deposit Paid: $${depositAmount.toFixed(2)}`, 65, currentY + 30, {
      fontSize: 10,
      align: "center",
      width: 480,
      color: "#10b981"
    });
    addText(`Remaining Balance: $${remainingBalance.toFixed(2)}`, 65, currentY + 45, {
      fontSize: 10,
      align: "center",
      width: 480,
      color: "#f59e0b"
    });
  }
  currentY += depositBoxHeight + 15;

  // Cancellation Section
  if (booking.email) {
    addBox(65, currentY, 480, 45, "#f8f8f8");
    const encodedEmail = Buffer.from(booking.email).toString("base64");
    const cancellationUrl = `${process.env.FRONTEND_URL}/cancel-booking/${booking.confirmationNumber}/${encodedEmail}`;
    
    addText("Need to cancel or reschedule?", 65, currentY + 8, {
      align: "center",
      width: 480,
      fontSize: 10
    });
    addText(cancellationUrl, 65, currentY + 25, {
      align: "center",
      width: 480,
      color: "#0066cc",
      underline: true,
      link: cancellationUrl,
      fontSize: 9
    });
    currentY += 60;
  }

  // Footer Section - Compact design
  const footerHeight = 90;
  addBox(50, currentY, 495, footerHeight, "#f8f8f8");
  
  // Footer text - more compact
  const footerContent = [
    { text: "Contact Us:", y: 8 },
    { text: "Phone: (415) 889-9108 • Email: markatoautodetail@gmail.com", y: 24 },
    { text: "Location: 1901 Park Blvd, Oakland, CA 94606", y: 40 },
    { text: "Thank you for choosing Markato Auto Detailing!", y: 56},
    { text: "Please present this confirmation at the time of service.", y: 72 }
  ];

  footerContent.forEach(item => {
    addText(item.text, 50, currentY + item.y, {
      align: "center",
      width: 495,
      color: "#333",
      fontSize: 10
    });
  });

  // Final position check
  const finalY = currentY + 90; // Footer height
  console.log(`PDF Layout Summary for ${booking.confirmationNumber}:`);
  console.log(`- Final content height: ${finalY} points`);
  console.log(`- Available page height: ${pageHeight} points`);
  console.log(`- Within single page: ${finalY <= pageHeight ? '✅ Yes' : '❌ No, will span multiple pages'}`);
  
  if (finalY > pageHeight) {
    console.warn(`⚠️  PDF content (${finalY}pts) exceeds single page height (${pageHeight}pts)`);
  }

  // Execute all drawing operations in correct order
  boxes.forEach(drawBox => drawBox());
  textOperations.forEach(drawText => drawText());

  return doc;
};