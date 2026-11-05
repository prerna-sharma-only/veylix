-- Creates the health_checks table --

CREATE TABLE health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    service_id UUID NOT NULL
        REFERENCES services(id),

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('UP', 'DOWN', 'DEGRADED')),

    http_status_code INTEGER,

    response_time_ms INTEGER
        CHECK (response_time_ms >= 0),

    error_message TEXT,

    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);