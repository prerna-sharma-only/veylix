-- Create a test migration___________
CREATE TABLE migration_runner_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Why this test?
-- - CREATE TABLE gives us a visible database change.
-- - The migration runner should execute it.
-- - The transaction should record version 006.
-- - A second execution should not attempt to create the table again.

-- What should happen internally?
-- 1. The runner reads all SQL migration files.
-- 2. It fetches applied versions from schema_migrations.
-- 3. It discovers that 006 hasn't been applied.
-- 4. It reads the SQL file.
-- 5. It starts a transaction.
-- 6. It creates migration_runner_test.
-- 7. It inserts version 006 into schema_migrations.
-- 8. It commits the transaction.