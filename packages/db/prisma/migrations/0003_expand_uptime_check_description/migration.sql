-- Additive expand migration: older application images do not select or write
-- this nullable column, while newer images can adopt it without a table rewrite.
ALTER TABLE "UptimeCheck" ADD COLUMN "description" TEXT;
