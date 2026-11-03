# Veylix — API Design

## 1. Overview

Veylix will expose a RESTful API using Node.js, Express, and TypeScript.

The API will allow the frontend and authorized API clients to interact with the platform.

Base URL during local development:

`http://localhost:3000/api/v1`

API versioning will use the `/v1` prefix.

## 2. HTTP Methods

| Method | Purpose |
|---|---|
| GET | Retrieve resources |
| POST | Create resources or trigger operations |
| PATCH | Partially update resources |
| PUT | Replace a resource |
| DELETE | Delete resources |

## 3. Authentication APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Authenticate a user |
| POST | `/auth/logout` | Yes | Log out |
| GET | `/auth/me` | Yes | Retrieve current user |

## 4. Service Management APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/services` | Yes | Register a service |
| GET | `/services` | Yes | List user's services |
| GET | `/services/:id` | Yes | Retrieve service details |
| PATCH | `/services/:id` | Yes | Update service configuration |
| DELETE | `/services/:id` | Yes | Delete a service |
| POST | `/services/:id/check` | Yes | Schedule an immediate health check |

### Register Service

**Endpoint:** `POST /services`

**Request body:**

```json
{
  "name": "Student Portal",
  "url": "https://example.com/health",
  "intervalSeconds": 60
}
```

**Successful response:** `201 Created`

```json
{
  "success": true,
  "message": "Service registered successfully",
  "data": {
    "id": "service-uuid",
    "name": "Student Portal",
    "url": "https://example.com/health",
    "intervalSeconds": 60,
    "isActive": true
  }
}
```

The URL must pass security and validation checks before monitoring is enabled.

## 5. Monitoring APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/services/:id/checks` | Yes | Retrieve health-check history |
| GET | `/services/:id/status` | Yes | Retrieve current service status |
| GET | `/dashboard/summary` | Yes | Retrieve overall dashboard summary |

### Health Check History

**Endpoint:** `GET /services/:id/checks`

Returns historical health-check records for a service.

Possible response fields:

- Check ID.
- Service ID.
- Status.
- Response time.
- HTTP status code.
- Error message.
- Check timestamp.

## 6. Incident APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/incidents` | Yes | List incidents |
| GET | `/incidents/:id` | Yes | Retrieve incident details |
| PATCH | `/incidents/:id/acknowledge` | Yes | Acknowledge an incident |
| PATCH | `/incidents/:id/resolve` | Yes | Manually resolve an incident |

Incident records will contain their status, affected service, start time, and resolution time.

Automatic incident detection and recovery confirmation will be handled by backend business logic.

## 7. Simulation APIs

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/simulations/scenarios` | Yes | List supported scenarios |
| POST | `/simulations/run` | Yes | Start a controlled simulation |
| GET | `/simulations/runs/:id` | Yes | Retrieve simulation status and result |

Simulations will operate only against our controlled demo application.

## 8. Standard HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| 200 | OK | Successful retrieval |
| 201 | Created | Service registered |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permission |
| 404 | Not Found | Service does not exist |
| 409 | Conflict | Duplicate or conflicting resource |
| 422 | Unprocessable Content | Business validation failure |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Required dependency unavailable |

## 9. Standard Response Structure

Successful responses will generally follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error responses will generally follow this structure:

```json
{
  "success": false,
  "message": "An error occurred",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

Sensitive internal information, passwords, tokens, and stack traces must not be exposed in API responses.

## 10. API Security

The API will implement:

- Authentication for protected endpoints.
- Authorization and resource ownership checks.
- Request validation.
- Secure password handling.
- Rate limiting.
- SSRF protection for monitoring URLs.
- Safe error handling.
- CORS configuration.

## 11. API Design Principles

- Use resource-oriented URLs.
- Use appropriate HTTP methods.
- Return meaningful HTTP status codes.
- Validate incoming data.
- Keep controllers separate from business logic.
- Enforce authorization at the backend.
- Use consistent response structures.
- Version the API to support future changes.

## 12. Implementation Note

This document describes the planned API contract.

Request validation schemas, exact response types, pagination parameters, authentication mechanisms, and error details will be refined during implementation.