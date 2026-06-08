-- Migration: Add Performance Indexes

-- BOOKING TABLE INDEXES
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
CREATE INDEX "Booking_tourId_idx" ON "Booking"("tourId");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX "Booking_isWaitlist_status_idx" ON "Booking"("isWaitlist", "status");

-- TOUR TABLE INDEXES
CREATE INDEX "Tour_status_idx" ON "Tour"("status");
CREATE INDEX "Tour_createdAt_idx" ON "Tour"("createdAt");
CREATE INDEX "Tour_status_departureDate_idx" ON "Tour"("status", "departureDate");

-- CUSTOMTOURLEAD TABLE INDEXES
CREATE INDEX "CustomTourLead_status_idx" ON "CustomTourLead"("status");
CREATE INDEX "CustomTourLead_createdAt_idx" ON "CustomTourLead"("createdAt");
CREATE INDEX "CustomTourLead_email_idx" ON "CustomTourLead"("email");

-- PROMOCODE TABLE INDEXES
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");
CREATE INDEX "PromoCode_validUntil_idx" ON "PromoCode"("validUntil");
CREATE INDEX "PromoCode_isActive_validUntil_idx" ON "PromoCode"("isActive", "validUntil");

-- TEAMMEMBER TABLE INDEXES
CREATE INDEX "TeamMember_email_idx" ON "TeamMember"("email");
CREATE INDEX "TeamMember_status_idx" ON "TeamMember"("status");

-- PAYMENT TABLE INDEX
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- BACKUP TABLE INDEX
CREATE INDEX "Backup_createdAt_idx" ON "Backup"("createdAt");
