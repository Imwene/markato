export async function up(db) {
    console.log('Adding performance indexes for customer extraction...');

    // Critical indexes for customer extraction queries
    await db.collection("bookings").createIndex(
        { contact: 1, createdAt: -1 },
        { name: "contact_createdAt" }
    );

    await db.collection("bookings").createIndex(
        { createdAt: -1, status: 1 },
        { name: "createdAt_status" }
    );

    await db.collection("customers").createIndex(
        { phone: 1, "statistics.lastBookingDate": -1 },
        { name: "phone_lastBookingDate" }
    );

    await db.collection("customers").createIndex(
        { "statistics.totalBookings": -1, "statistics.totalSpent": -1 },
        { name: "totalBookings_totalSpent" }
    );

    console.log('Performance indexes added successfully');
}

export async function down(db) {
    console.log('Removing performance indexes...');

    await db.collection("bookings").dropIndex("contact_createdAt");
    await db.collection("bookings").dropIndex("createdAt_status");
    await db.collection("customers").dropIndex("phone_lastBookingDate");
    await db.collection("customers").dropIndex("totalBookings_totalSpent");

    console.log('Performance indexes removed');
}