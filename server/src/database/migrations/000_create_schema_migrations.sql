CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,   -- Migration identifier, such as 001
    name VARCHAR(255) NOT NULL,         -- Descriptive migration name
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- When that migration was recorded as applied
);

-- Why is version the primary key? Because the same migration must not be recorded twice.
-- Creates the table only if it doesn't already exist. If it exists, PostgreSQL skips the creation without throwing that error.
-- Baseline means telling the migration system that certain database migrations have already been applied, even though they were originally executed manually.