-- Creates the simulation_runs table --

CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id),

    service_id UUID NOT NULL
        REFERENCES services(id),

    scenario_type VARCHAR(50) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    result JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_id: identifies who initiated the simulation.
-- service_id: identifies which service is being simulated.
-- scenario_type: identifies the simulation scenario.
-- status: tracks execution progress.
-- result JSONB: stores flexible simulation output.
-- started_at: allows NULL while a simulation is pending.
-- completed_at: allows NULL until execution ends.

--NOTE : One design detail to remember: the two foreign keys don't independently guarantee that the selected service belongs to the selected user. We'll strengthen that relationship later.