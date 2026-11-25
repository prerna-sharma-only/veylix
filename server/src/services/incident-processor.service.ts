
import { pool } from "../config/db.js";
import { evaluateIncidentLifecycle } from "./incident-lifecycle.service.js";
import type { CheckStatus } from "./incident-lifecycle.service.js";

export const processHealthCheck = async (
    serviceId: string,
    checkStatus: CheckStatus,
    httpStatusCode: number | null,
    responseTimeMs: number,
    errorMessage: string | null,
): Promise<void> => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");


        const serviceResult = await client.query(
            `SELECT
                id,
                consecutive_failures,
                consecutive_successes
            FROM services
            WHERE id = $1
            FOR UPDATE`,
            [serviceId],
        ); //FOR UPDATE: locks the selected service row

        if (serviceResult.rows.length === 0) {
            throw new Error("Service not found");
        }

        const service = serviceResult.rows[0]; //contains the current counters from PostgreSQL

        //Retrieve the unresolved incident
        const incidentResult = await client.query(
            `SELECT id, status
            FROM incidents
            WHERE service_id = $1
            AND status IN ('OPEN', 'RECOVERING')
            FOR UPDATE`,
            [serviceId],
        );

        const currentIncident = incidentResult.rows[0] ?? null;

        //Evaluate the incident lifecycle
        const lifecycleResult = evaluateIncidentLifecycle({
            checkStatus,
            consecutiveFailures: service.consecutive_failures,
            consecutiveSuccesses: service.consecutive_successes,
            currentIncidentStatus: currentIncident?.status ?? null,
        });

        //Save the health-check history
        await client.query(
            `INSERT INTO health_checks (
                service_id,
                status,
                http_status_code,
                response_time_ms,
                error_message
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
                serviceId,
                checkStatus,
                httpStatusCode,
                responseTimeMs,
                errorMessage,
            ],
        );


        await client.query(
            `UPDATE services
            SET
            consecutive_failures = $1,
            consecutive_successes = $2,
            updated_at = NOW()
            WHERE id = $3`,
            [
                lifecycleResult.consecutiveFailures,
                lifecycleResult.consecutiveSuccesses,
                serviceId,
            ],
        );


        switch (lifecycleResult.incidentAction) {
            case "CREATE":
                await client.query(
                    `INSERT INTO incidents (
         service_id,
         status,
         title,
         description
       )
       VALUES ($1, 'OPEN', $2, $3)`,
                    [serviceId, "Service is unavailable", errorMessage],
                );
                break;

            case "START_RECOVERY":
                if (!currentIncident) {
                    throw new Error("Cannot start recovery: incident not found");
                }

                await client.query(
                    `UPDATE incidents
       SET status = 'RECOVERING',
           updated_at = NOW()
       WHERE id = $1`,
                    [currentIncident.id],
                );
                break;

            case "REOPEN":
                if (!currentIncident) {
                    throw new Error("Cannot reopen: incident not found");
                }

                await client.query(
                    `UPDATE incidents
       SET status = 'OPEN',
           resolved_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
                    [currentIncident.id],
                );
                break;

            case "RESOLVE":
                if (!currentIncident) {
                    throw new Error("Cannot resolve: incident not found");
                }

                await client.query(
                    `UPDATE incidents
       SET status = 'RESOLVED',
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
                    [currentIncident.id],
                );
                break;

            case "NONE":
                // No incident modification is required.
                break;
        }


        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


// Action	What PostgreSQL does
// CREATE	Inserts a new incident
// START_RECOVERY	Changes OPEN to RECOVERING
// REOPEN	Changes RECOVERING to OPEN
// RESOLVE	Changes RECOVERING to RESOLVED and records the time