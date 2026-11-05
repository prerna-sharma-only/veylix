-- Creates users --

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,    
    -- Important design note: This initial UNIQUE(email) constraint means a deleted account's email cannot be reused for a new account. That's intentional for our initial design; we'll revisit account re-registration and restoration policy later.

    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- DEFAULT NOW() supplies a value when a row is inserted without an explicit value. It does not automatically update the timestamp on subsequent updates.

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ
);

-- CREATE TABLE users	-  Creates the users table
-- id UUID	            -   Defines the identifier type
-- PRIMARY KEY	        -   Uniquely identifies each user
-- DEFAULT gen_random_uuid()	- Generates the ID automatically
-- name VARCHAR(100)	-   Stores the user's name
-- email VARCHAR(255)	-   Stores the login email
-- UNIQUE	            -   Prevents duplicate emails
-- password_hash TEXT	-   Stores the password hash
-- DEFAULT NOW()	    -   Automatically sets the timestamp
-- deleted_at TIMESTAMPTZ	- Stores account deletion time; NULL means active
