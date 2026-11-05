-- Creates services --

CREATE TABLE services (
    
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id),  --the supplied UUID must already exist in the users table

    name VARCHAR(150) NOT NULL,

    url TEXT NOT NULL,

    interval_seconds INTEGER NOT NULL
        CHECK (interval_seconds > 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REFERENCES users(id) ensures the owner exists.
-- CHECK (interval_seconds > 0) prevents invalid monitoring intervals.
-- DEFAULT TRUE means a newly registered service is active unless specified otherwise.
-- referential integrity: PostgreSQL ensures that relationships between tables remain valid