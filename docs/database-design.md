# Veylix — Database Design

## 1. Overview

Veylix will use PostgreSQL as its primary relational database.

PostgreSQL will store persistent application data, including users, monitored services, health-check results, incidents, and simulation records.

The database will maintain relationships between entities using primary keys and foreign keys.

## 2. Initial Database Tables

The initial database design contains five main tables:

1. users
2. services
3. health_checks
4. incidents
5. simulation_runs

## 3. Users Table

Stores registered user account information.

| Column | Data Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | Primary Key | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User's name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | TEXT | NOT NULL | Hashed password |
| created_at | TIMESTAMPTZ | NOT NULL | Account creation time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

Passwords will never be stored in plain text.

## 4. Services Table

Stores applications registered for monitoring.

| Column | Data Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | Primary Key | Unique service identifier |
| user_id | UUID | Foreign Key, NOT NULL | Service owner |
| name | VARCHAR(150) | NOT NULL | Service name |
| url | TEXT | NOT NULL | Authorized health-check URL |
| interval_seconds | INTEGER | NOT NULL | Monitoring interval |
| is_active | BOOLEAN | NOT NULL | Monitoring enabled or disabled |
| created_at | TIMESTAMPTZ | NOT NULL | Registration time |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update time |

Relationship:

One user can own multiple services.

Each service belongs to one user.

The interval_seconds column must be greater than zero.
A CHECK constraint will enforce this rule.

## 5. Health Checks Table

Stores individual monitoring results.

| Column | Data Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | Primary Key | Unique check identifier |
| service_id | UUID | Foreign Key, NOT NULL | Monitored service |
| status | VARCHAR(20) | NOT NULL | UP, DOWN, or DEGRADED |
| response_time_ms | INTEGER | Nullable | Response duration |
| http_status_code | INTEGER | Nullable | HTTP response status |
| error_message | TEXT | Nullable | Failure information |
| checked_at | TIMESTAMPTZ | NOT NULL | Check timestamp |

Relationship:

One service can have many health-check records.

Each health-check record belongs to one service.

Purpose:

- Maintain historical monitoring data.
- Calculate uptime.
- Analyze response-time trends.
- Track service failures.
- Support incident detection.

## 6. Incidents Table

Stores detected service incidents.

| Column | Data Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | Primary Key | Unique incident identifier |
| service_id | UUID | Foreign Key, NOT NULL | Affected service |
| title | VARCHAR(200) | NOT NULL | Incident title |
| status | VARCHAR(20) | NOT NULL | OPEN, RECOVERING, RESOLVED |
| started_at | TIMESTAMPTZ | NOT NULL | Incident start time |
| resolved_at | TIMESTAMPTZ | Nullable | Recovery confirmation time |
| latest_error | TEXT | Nullable | Latest failure information |
| updated_at | TIMESTAMPTZ | NOT NULL | Last incident update |

Relationship:

One service can have multiple incidents over its lifetime.

A service must not have more than one unresolved incident at a time.

An unresolved incident is one whose status is OPEN or RECOVERING.

The incident lifecycle will support:

- Creation after consecutive failures reach the configured threshold.
- Updates while failures continue.
- Transition to RECOVERING after a successful check.
- Return to OPEN if another failure occurs.
- Resolution after two consecutive successful checks.

Database constraints and transaction handling will help prevent duplicate unresolved incidents.

The status column will accept only OPEN, RECOVERING, and RESOLVED.
A CHECK constraint will enforce the permitted values.

Manual incident resolution will be treated as a privileged override.
Automatic resolution will require two consecutive successful health checks.

## 7. Simulation Runs Table

Stores controlled simulation execution records.

| Column | Data Type | Constraints | Purpose |
|---|---|---|---|
| id | UUID | Primary Key | Unique simulation identifier |
| user_id | UUID | Foreign Key, NOT NULL | User who started the simulation |
| scenario | VARCHAR(100) | NOT NULL | Simulation scenario |
| status | VARCHAR(20) | NOT NULL | PENDING, RUNNING, COMPLETED, FAILED |
| started_at | TIMESTAMPTZ | Nullable | Simulation start time |
| completed_at | TIMESTAMPTZ | Nullable | Simulation completion time |
| created_at | TIMESTAMPTZ | NOT NULL | Record creation time |

Relationship:

One user can initiate multiple simulation runs.

Each simulation run belongs to one user.

Simulations will execute only against our controlled demo environment.

## 8. Database Relationships

```text
USERS
  |
  | 1 : MANY
  |
  v
SERVICES
  |
  | 1 : MANY
  |
  +-------------> HEALTH_CHECKS
  |
  |
  +-------------> INCIDENTS


USERS
  |
  | 1 : MANY
  |
  v
SIMULATION_RUNS
```

## 9. Primary Keys and Foreign Keys

### Primary Key

A primary key uniquely identifies each record in a table.

Example:

`users.id`

Every user will have a unique UUID.

### Foreign Key

A foreign key references a key in another table and establishes a relationship between records.

Examples:

- `services.user_id` references `users.id`.
- `health_checks.service_id` references `services.id`.
- `incidents.service_id` references `services.id`.
- `simulation_runs.user_id` references `users.id`.

Foreign keys help maintain referential integrity.

## 10. Indexing Strategy

Indexes will be introduced based on frequently executed queries.

Initial candidates:

| Table | Column(s) | Reason |
|---|---|---|
| users | email | Efficient login lookup |
| services | user_id | Retrieve services belonging to a user |
| health_checks | service_id, checked_at | Retrieve recent checks for a service |
| incidents | service_id, status | Retrieve unresolved incidents |
| incidents | started_at | Sort incidents by start time |
| simulation_runs | user_id | Retrieve a user's simulations |

We will evaluate indexes as query patterns and data volume become clearer.

Indexes improve certain read queries but consume storage and add overhead to writes.

## 11. Data Integrity and Consistency

The database will use:

- Primary keys.
- Foreign keys.
- NOT NULL constraints.
- UNIQUE constraints where appropriate.
- CHECK constraints for permitted values.
- Transactions for operations that must succeed or fail together.
- Appropriate indexes for frequently queried data.

A partial unique index on unresolved incidents per service is a possible implementation:

```sql
CREATE UNIQUE INDEX one_unresolved_incident_per_service
ON incidents (service_id)
WHERE status IN ('OPEN', 'RECOVERING');
```

This prevents multiple unresolved incidents for the same service at the database level.

CHECK constraints will validate monitoring intervals and permitted status values.

## 12. Future Database Improvements

Potential improvements include:

- Pagination for health-check history.
- Retention policies for older monitoring records.
- Additional indexes based on query analysis.
- Database transactions for incident processing.
- Connection pooling.
- Query optimization.
- Monitoring database performance.

## 13. Implementation Note

This document describes the initial logical database design.

The actual PostgreSQL schema, migrations, constraints, and indexes will be implemented and refined during backend development.