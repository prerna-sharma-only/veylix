
-- Track consecutive health-check failures and successes for each service.

ALTER TABLE services
ADD COLUMN consecutive_failures INTEGER NOT NULL DEFAULT 0
CHECK (consecutive_failures >= 0);

ALTER TABLE services
ADD COLUMN consecutive_successes INTEGER NOT NULL DEFAULT 0
CHECK (consecutive_successes >= 0);
