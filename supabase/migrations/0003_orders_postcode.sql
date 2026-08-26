-- Adds a dedicated postcode field to orders, alongside the existing
-- free-text address, so shipping labels don't have to be hand-parsed out
-- of one combined address string.
alter table orders add column if not exists postcode text;
