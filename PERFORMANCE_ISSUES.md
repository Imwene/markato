# Performance Issues for Single-Core Server

This document identifies critical performance issues in the deployment folder that would cause a single-core server to become overloaded.

## Critical Issues (Blocking Event Loop)

### 1. Synchronous File I/O Operations
**Location:** `deployment/src/services/pdfService.js` and `deployment/src/services/emailService.js`

**Problem:**
- `fs.readFileSync()` blocks the event loop during file reads
- These operations occur on every PDF generation and email send request
- On a single-core server, this completely blocks all other requests

**Files:**
- `pdfService.js:12` - `const LOGO = fs.readFileSync(logoPath);`
- `emailService.js:16` - `const JPG_MARKATO = fs.readFileSync(logoPath).toString("base64");`

**Impact:** HIGH - Blocks event loop during every PDF/email operation

**Solution:** Use `fs.promises.readFile()` or load files once at startup

---

## Critical Issues (Memory Exhaustion)

### 2. Loading ALL Bookings Without Pagination
**Location:** `deployment/src/controllers/bookingController.js:80`

**Problem:**
```javascript
// Backward compatibility: if no page is provided, return full list as before
if (!page) {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();
  return res.json({ success: true, data: bookings });
}
```
- Loads entire booking collection into memory
- No limit on result size
- Will crash server as bookings grow

**Impact:** CRITICAL - Will crash server with large datasets

**Solution:** Enforce pagination, remove backward compatibility mode

---

### 3. Dashboard Stats Loading All Bookings
**Location:** `deployment/src/controllers/adminController.js:39`

**Problem:**
```javascript
// Calculate total revenue
const bookings = await Booking.find();
const totalRevenue = bookings.reduce(
  (sum, booking) => sum + (booking.totalPrice || 0),
  0
);
```
- Loads all bookings to calculate revenue in JavaScript
- Should use MongoDB aggregation instead

**Impact:** HIGH - Memory exhaustion and slow response

**Solution:** Use `Booking.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }])`

---

## Critical Issues (N+1 Queries)

### 4. Sequential Database Queries in Availability Check
**Location:** `deployment/src/controllers/bookingController.js:606-620`

**Problem:**
```javascript
await Promise.all(
  businessHours.map(async (time) => {
    const dateTimePattern = `^${date}, ${time}$`;
    const bookingsCount = await Booking.countDocuments({
      dateTime: { $regex: new RegExp(dateTimePattern) },
      status: { $nin: ["cancelled"] },
    });
    slots[time] = { available: bookingsCount < maxBookingsPerSlot };
  })
);
```
- 12 sequential database queries (one per time slot)
- Each query uses regex which can't use indexes efficiently
- Blocks database connection pool

**Impact:** HIGH - Slow response times, connection pool exhaustion

**Solution:** Single aggregation query to count all slots at once

---

### 5. Customer Statistics Update Loads All Bookings
**Location:** `deployment/src/models/customerModel.js:92`

**Problem:**
```javascript
customerSchema.methods.updateStatistics = async function() {
  const Booking = model('Booking');
  const bookings = await Booking.find({ _id: { $in: this.bookingIds } });
  // ... processes all bookings in memory
};
```
- Loads all bookings for a customer into memory
- Called during autolink operations which can process 500+ bookings
- No batching or aggregation

**Impact:** HIGH - Memory spikes during customer operations

**Solution:** Use aggregation pipeline to calculate statistics

---

## Database Query Inefficiencies

### 6. Missing Indexes for Frequent Queries
**Location:** `deployment/src/models/bookingModel.js`

**Problem:**
- `contact` field has no index but is used in regex searches (line 103, 227)
- `email` field has no index but is used in regex searches (line 105)
- Regex queries on `dateTime` can't use the existing index efficiently

**Impact:** MEDIUM-HIGH - Slow queries as data grows

**Solution:** Add indexes:
```javascript
bookingSchema.index({ contact: 1 });
bookingSchema.index({ email: 1 });
// For regex prefix searches, consider text index
```

---

### 7. Inefficient Regex Queries on dateTime
**Location:** Multiple controllers

**Problem:**
- Many queries use regex on `dateTime` string field:
  - `bookingController.js:152` - Today's bookings
  - `bookingController.js:611` - Availability checks
  - `adminController.js:115` - Today's bookings
  - `adminController.js:375` - Weekly bookings
- String regex can't use indexes efficiently
- Forces full collection scan

**Impact:** HIGH - Database CPU exhaustion on large collections

**Solution:** 
- Store `appointmentDate` as proper Date field
- Add index on date field
- Use date range queries instead of regex

---

### 8. Complex Aggregation Pipeline in getAllBookings
**Location:** `deployment/src/controllers/bookingController.js:161-379`

**Problem:**
- Extremely complex aggregation pipeline parsing dateTime strings
- Hundreds of lines of nested MongoDB operators
- CPU-intensive date parsing operations
- Runs on every paginated request

**Impact:** HIGH - CPU-bound operation on single-core

**Solution:**
- Store appointment date as Date field in database
- Simplify query to use date comparison
- Consider background job to normalize existing data

---

## Inefficient Batch Operations

### 9. Synchronous Customer Extraction Loop
**Location:** `deployment/src/controllers/customerController.js:396-446`

**Problem:**
```javascript
for (const booking of recentBookings) {
  // Process each booking synchronously
  // Multiple database queries per iteration
  // No batching
}
```
- Processes 1000 bookings sequentially
- Multiple DB operations per booking
- Blocks event loop during entire operation

**Impact:** MEDIUM-HIGH - Request timeout, blocks other requests

**Solution:** 
- Use batch inserts/updates
- Process in chunks with setImmediate between chunks
- Consider background job for large operations

---

### 10. Auto-link Bookings Sequential Processing
**Location:** `deployment/src/controllers/customerController.js:257-299`

**Problem:**
```javascript
for (let i = 0; i < bookings.length; i += batchSize) {
  // Process batches, but still sequential
  // Multiple save operations
}
```
- Processes bookings in batches but sequentially
- Saves customer after each batch
- Could be optimized with bulk operations

**Impact:** MEDIUM - Slow for large linking operations

**Solution:** Use MongoDB bulk write operations

---

## Other Performance Issues

### 11. No Query Result Limits in Some Endpoints
**Location:** Multiple controllers

**Problem:**
- `adminController.js:335` - `getAllBookings` has no limit
- Some aggregation pipelines don't limit results

**Impact:** MEDIUM - Large response payloads

**Solution:** Always enforce reasonable limits

---

### 12. Missing Connection Pool Optimization
**Location:** `deployment/src/config/database.js`

**Current settings:**
- `maxPoolSize: 10` (reasonable)
- `minPoolSize: 2` (reasonable)

**Potential Issue:**
- With many concurrent requests doing sequential queries (like availability check), pool may be exhausted

**Solution:** Monitor pool usage, consider increasing if needed

---

### 13. PDF Generation Blocking Response
**Location:** `deployment/src/controllers/bookingController.js:524-548`

**Problem:**
- PDF generation happens synchronously during request
- Blocks response until PDF is fully generated
- CPU-intensive operation on single-core

**Impact:** MEDIUM - Slow response times

**Solution:** 
- Stream PDF generation (already uses pipe, but could optimize)
- Consider pre-generating or caching PDFs

---

## Recommended Priority Fixes

1. **IMMEDIATE (Blocking):**
   - Fix synchronous file I/O (Issue #1)
   - Enforce pagination in getAllBookings (Issue #2)
   - Use aggregation for dashboard revenue (Issue #3)

2. **HIGH PRIORITY (Performance):**
   - Fix N+1 queries in availability check (Issue #4)
   - Add missing database indexes (Issue #6)
   - Convert dateTime to Date field (Issue #7)

3. **MEDIUM PRIORITY (Optimization):**
   - Optimize customer extraction (Issue #9)
   - Use bulk operations for auto-linking (Issue #10)
   - Simplify aggregation pipeline (Issue #8)

---

## Testing Recommendations

- Load test with realistic booking counts (1000+ bookings)
- Monitor memory usage during dashboard loads
- Monitor database query times
- Test availability check under concurrent load
- Profile CPU usage during PDF generation

