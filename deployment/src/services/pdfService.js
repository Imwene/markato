import PDFDocument from 'pdfkit';

export const generateBookingPDF = (booking) => {
  const doc = new PDFDocument();
  
  // Add content to PDF
  doc.fontSize(20).text('Booking Confirmation', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Confirmation Number: ${booking.confirmationNumber}`);
  doc.text(`Customer: ${booking.name}`);
  doc.text(`Service: ${booking.serviceName}`);
  doc.text(`Date & Time: ${booking.dateTime}`);
  doc.text(`Vehicle: ${booking.makeModel} (${booking.vehicleType})`);
  doc.moveDown();
  doc.text(`Total Amount: $${booking.totalPrice}`);

  return doc;
};