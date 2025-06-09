// This file contains the following security functions for each API to implement:
//
// "logevent" Creates a log whenever an API is called, if there is a non-anonymous user behind the action
// "validateRequestOrigin" Stops APIs being called from URLs and other sources, even if an authorised user is logged in
// "rateLimit" Establishes and emposes a rate limit of 60 requests/min for all APIs per unique IP Address

import { db } from "@/db";
import { logsTable } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";


export async function logEvent(userID: string, eventID: string) {
    if (!userID) return; // Ensure userID is valid

    try {
        await db.insert(logsTable).values({
            logID: uuidv4(), // Unique Log ID
            userID,
            eventID,
        });
        console.log(`Log created for user ${userID}, event ${eventID}`);
    } catch (error) {
        console.error("Failed to log event:", error);
    }
}

export async function validateRequestOrigin(req: Request): Promise<string> {
    const referer = req.headers.get("referer") || "";
    const host = req.headers.get("host") || "";

    // Check if request is coming from the website
    if (!referer || !referer.includes(host)) {
        console.warn("Unauthorized API access attempt blocked!");
        throw new Error("Unauthorized request - Invalid origin");
    }

    try {
        // Fetch authenticated user
        const response = await fetch("http://localhost:3000/api/auth-status", {
            method: "GET",
            credentials: "include",
            headers: { cookie: req.headers.get("cookie") || "" }, // Pass cookies for authentication
        });

        if (!response.ok) {
            console.warn("Auth verification failed, possibly not logged in.");
            throw new Error("Unauthorized request - Failed authentication");
        }

        const data = await response.json();
        if (!data.loggedIn || !data.user?.userID) {
            throw new Error("Unauthorized request - User not logged in");
        }

        return data.user.userID;
    } catch (error) {
        console.error("Error verifying authentication:", error);
        throw new Error("Unauthorized request - Authentication failed");
    }
}


/**
 * Fetches the authenticated user's ID by calling the `/api/auth-status` endpoint.
 * @param req - The request object to pass headers.
 * @returns userID (string) if authenticated, `null` if not.
 */
export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
    try {
        const authResponse = await fetch(new URL("/api/auth-status", req.url), {
            method: "GET",
            headers: req.headers, // Pass headers to maintain session
        });

        if (!authResponse.ok) {
            console.warn("Unauthorized API access attempt.");
            return null;
        }

        const authData = await authResponse.json();
        return authData.user?.userID || null;
    } catch (error) {
        console.error("Error verifying user authentication:", error);
        return null;
    }
}

const rateLimitMap = new Map<string, { count: number; lastRequest: number }>();

const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 60, // Max requests per window
};

export function rateLimit(ip: string, endpoint: string): boolean {
    const key = `${ip}-${endpoint}`;
    const now = Date.now();

    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, { count: 1, lastRequest: now });
        return true;
    }

    const requestData = rateLimitMap.get(key)!;

    // If time window has passed, reset count
    if (now - requestData.lastRequest > RATE_LIMIT.windowMs) {
        requestData.count = 1;
        requestData.lastRequest = now;
        return true;
    }

    // Check if request count exceeds limit
    if (requestData.count >= RATE_LIMIT.maxRequests) {
        return false; // Request should be blocked
    }

    // Increment request count
    requestData.count++;
    return true;
}