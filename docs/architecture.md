# Veylix — System Architecture

## 1. Project Overview

Veylix is an Application Reliability and Incident Intelligence Platform designed to monitor application availability, detect failures, track incidents, and provide insights into service reliability.

Users can register public health-check endpoints of applications they own or are authorized to monitor. Veylix periodically checks these endpoints and records their availability, response time, HTTP status codes, and failures.

The platform also provides a controlled simulation environment where users can experience different failure scenarios using our own demo application.

### Main Objectives

- Monitor application availability and response times.
- Detect service failures and degradation.
- Maintain historical health-check records.
- Automatically create and manage incidents.
- Provide real-time dashboard updates.
- Process monitoring tasks asynchronously.
- Provide controlled failure simulations.

## 2. Application Modes

### 2.1 Real Monitoring

Users register authorized public HTTP/HTTPS health-check endpoints.

Veylix periodically sends requests and records the results.

### 2.2 Simulation Lab

Users can run controlled scenarios against our own demo application, such as:

- Slow responses.
- HTTP 500 errors.
- Service unavailability.
- Intermittent failures.
- Background-job failures.

Simulations will be restricted to our own controlled environment.

## 3. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React | User interface |
| Frontend Language | TypeScript | Type safety |
| Backend Runtime | Node.js | JavaScript execution |
| Backend Framework | Express | HTTP server and API routing |
| Backend Language | TypeScript | Type-safe backend development |
| Database | PostgreSQL | Persistent relational storage |
| Job Queue | BullMQ | Background job management |
| In-memory Store | Redis | Queue coordination and caching |
| Real-time Communication | Socket.IO | Live dashboard updates |
| Testing | Vitest, Supertest, Playwright | Automated testing |
| Containerization | Docker | Consistent development environment |
| Continuous Integration | GitHub Actions | Automated checks |

Technologies will be introduced incrementally as the project develops.

## 4. Architecture Style

Veylix will initially follow a Modular Monolith architecture.

The main backend will be one deployable Express application, organized into independent modules.

### Why Modular Monolith?

- Easier development and debugging.
- Clear separation of responsibilities.
- Simpler deployment than microservices.
- Easier management of shared database transactions.
- Less infrastructure complexity.

The monitoring worker will eventually run as a separate process because background jobs have a different execution lifecycle from HTTP requests.

## 5. High-Level System Architecture

```text
                 VEYLIX
                    |
          +---------+---------+
          |                   |
          v                   v
     React Frontend       API Clients
          |                   |
          +---------+---------+
                    |
                    v
              Express API
                    |
       +------------+------------+
       |            |            |
       v            v            v
  Auth Module  Service Module  Incident Module
       |            |            |
       +------------+------------+
                    |
                    v
                PostgreSQL
                    |
                    |
              Monitoring Jobs
                    |
                    v
                Redis
                    |
                    v
              BullMQ Worker
                    |
                    v
          Authorized Health URLs
                    |
                    v
          Store Health Check Results
                    |
                    v
            Incident Detection
                    |
                    v
                Socket.IO
                    |
                    v
             React Dashboard
```

## 6. Component Responsibilities

### 6.1 React Frontend

Provides the user interface for:

- User registration and login.
- Service registration and management.
- Monitoring dashboards.
- Health-check history.
- Incident management.
- Simulation scenarios.

### 6.2 Express Backend

Handles HTTP requests, authentication, validation, business logic, and communication with the database and job queue.

### 6.3 PostgreSQL

Stores persistent application data, including:

- Users.
- Monitored services.
- Health-check results.
- Incidents.
- Simulation runs.

### 6.4 Redis and BullMQ

Redis provides the data store used by BullMQ.

BullMQ manages background jobs such as:

- Scheduled health checks.
- User-triggered health checks.
- Retry scheduling.
- Simulation jobs.

Redis: In-memory data store used by BullMQ.
BullMQ: Background job and queue management library.
Worker: Separate process that consumes and executes queued jobs.

### 6.5 Background Worker

Processes queued jobs independently from normal API requests.

It executes health checks, records their results, and triggers incident processing.

### 6.6 Socket.IO

Sends real-time events to connected dashboard clients.

Examples:

- `service.status_changed`
- `incident.created`
- `incident.resolved`

## 7. Monitoring Workflow

1. A user registers an authorized health-check endpoint.
2. The backend validates the service configuration.
3. The service is saved in PostgreSQL.
4. A monitoring job is scheduled.
5. A background worker executes the health check.
6. The result is stored in PostgreSQL.
7. Incident detection evaluates the result.
8. Socket.IO sends relevant updates to the frontend.
9. The dashboard displays the latest monitoring information.

## 8. Incident Lifecycle

Veylix will maintain one unresolved incident per service.

Initial incident states:

- `OPEN`: The service is failing.
- `RECOVERING`: At least one successful health check has occurred, but recovery is not yet confirmed.
- `RESOLVED`: Recovery has been confirmed.

Initial recovery policy:

- A configurable consecutive-failure threshold will determine when an incident is created.
- Further failures update the existing incident.
- The first successful check moves the incident to `RECOVERING`.
- A failure during recovery returns the incident to `OPEN`.
- Two consecutive successful checks confirm recovery and resolve the incident.

```text
       2 consecutive failures
                 |
                 v
               OPEN
                 |
                 | 1 successful check
                 v
            RECOVERING
              /     \
             /       \
      Failure       2 consecutive
          |          successful checks
          |               |
          v               v
         OPEN          RESOLVED
```

## 9. Security Considerations

Since users can submit URLs for monitoring, Veylix must protect against Server-Side Request Forgery (SSRF).

Planned safeguards include:

- Allow only HTTP and HTTPS schemes.
- Block localhost and private/internal IP ranges.
- Validate DNS resolution and connection destinations.
- Validate redirect destinations or disable redirects.
- Apply connection and response timeouts.
- Limit response sizes.
- Rate-limit user-triggered checks.
- Restrict simulations to controlled demo infrastructure.
- Protect user data and authentication credentials.

## 10. Initial Engineering Principles

- Separation of concerns.
- Type safety.
- Secure input validation.
- Database consistency.
- Reliable background processing.
- Automated testing.
- Clear error handling.
- Maintainable modular code.

## 11. Future Enhancements

Potential future improvements include:

- OpenTelemetry integration.
- More detailed application diagnostics.
- Advanced uptime and latency analytics.
- Notification integrations.
- More sophisticated incident correlation.
- Additional monitoring and recovery workflows.