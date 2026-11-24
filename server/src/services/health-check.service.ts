import { performance } from "node:perf_hooks"; //node:perf_hooks - built-in Node.js module that provides performance measurement utilities. We don't need to install anything using npm.

export type HealthStatus = "UP" | "DOWN" | "DEGRADED"; //HealthStatus means a variable using this type can only contain "UP", "DOWN", or "DEGRADED

export interface HealthCheckResult { //// interface defines the structure an object must follow.
    status: HealthStatus;
    httpStatusCode: number | null; //the value can be either a number or null
    responseTimeMs: number;
    errorMessage: string | null;
}

const REQUEST_TIMEOUT_MS = 5000; //Maximum time to wait for response headers
const RESPONSE_TIME_THRESHOLD_MS = 2000; //Above this, a successful HTTP response is DEGRADED

//AbortSignal is a built-in JavaScript API that allows an asynchronous operation, such as Fetch, to be cancelled
//.timeout(5000) creates a signal that automatically aborts the operation after 5000 milliseconds

export const checkEndpoint = async (
    url: string, //the function receives a URL as a string
): Promise<HealthCheckResult> => {  //the function returns a Promise that will eventually resolve to a HealthCheckResult
    const startTime = performance.now(); //returns a high-resolution, monotonic timestamp, useful for measuring elapsed time

    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            redirect: "manual", //Prevents Fetch from automatically following redirects (helps in SSRF risk)
        });

        const responseTimeMs = Math.round(performance.now() - startTime);

        const httpStatusCode = response.status; //need in health check history!

        //Fetch returns a Response object. That object contains several useful properties:
        // - response.status — numerical HTTP status, such as 200, 404, or 500.
        // - response.ok — true for status codes 200–299.
        // - response.statusText — a short status description, when provided

        const isSuccessfulStatus = response.ok;

        try {
            await response.body?.cancel();
            //Fetch gives us a response body even when we don't need to read it. Calling response.body?.cancel() tells the stream that we don't need its contents.
            // The ?. operator means: only call cancel() if a response body exists.
        } catch {
            // Ignore cleanup errors; they should not change the health result.
        }

        if (response.status >= 300 && response.status < 400) {
            return {
                status: "DOWN",
                httpStatusCode,
                responseTimeMs,
                errorMessage: "Endpoint returned a redirect",
            };
        }

        let status: HealthStatus;

        if (!isSuccessfulStatus) {
            status = "DOWN";
        } else if (responseTimeMs > RESPONSE_TIME_THRESHOLD_MS) {
            status = "DEGRADED";
        } else {
            status = "UP";
        }

        return {
            status,
            httpStatusCode,
            responseTimeMs,
            errorMessage: null,
        };

    } catch (error) {
        const responseTimeMs = Math.round(
            performance.now() - startTime
        );

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";  //error instanceof Error - Checks whether the caught value is a JavaScript Error object

        const isTimeout = error instanceof Error &&
            error.name === "TimeoutError"; //Identifies the timeout error produced by AbortSignal.timeout()

        return {
            status: "DOWN",
            httpStatusCode: null,
            responseTimeMs,
            errorMessage: isTimeout ? "Request timed out" : errorMessage,
        };
    }

};