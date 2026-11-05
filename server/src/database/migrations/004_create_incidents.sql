-- Creates the incidents table --

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    service_id UUID NOT NULL
        REFERENCES services(id),

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('OPEN', 'RECOVERING', 'RESOLVED')),

    title VARCHAR(200) NOT NULL,

    description TEXT,

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A service can have only one unresolved incident at a time.

CREATE UNIQUE INDEX one_unresolved_incident_per_service
ON incidents (service_id)
WHERE status IN ('OPEN', 'RECOVERING');

-- PARTIAL UNIQUE INDEX

--It combines two ideas:
-- - UNIQUE: prevents duplicate values for the indexed key.
-- - WHERE: applies that uniqueness rule only to rows matching the condition.

-- Service A has an OPEN incident → another OPEN incident for Service A is rejected.
-- Service A has a RECOVERING incident → another unresolved incident is rejected.
-- Service A has a RESOLVED incident → a new incident is allowed.

--SQL statement	What it does
-- CREATE TABLE	-> Creates a table and its columns
-- CREATE INDEX	-> Creates an index on an existing table
-- CREATE UNIQUE INDEX -> Creates an index that enforces uniqueness
-- WHERE in this index	-> Limits which rows participate in that index