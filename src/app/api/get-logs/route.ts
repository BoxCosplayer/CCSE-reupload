import { NextResponse } from "next/server";
import { db } from "@/db";
import {eventsTable, logsTable, usersTable} from "@/db/schema";
import { desc, eq, and, like, sql } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-logs";

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({ error: "Unauthorized request" }, { status: 403 });
        }
        const userID = await validateRequestOrigin(req);

        // Extract query params
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get("page")) || 1;
        const filter = searchParams.get("filter") || "";

        // Define pagination limits
        const logsPerPage = 20;
        const offset = (page - 1) * logsPerPage;

        // Build query with optional filtering
        let query = db
            .select({
                logID: logsTable.logID,
                eventID: logsTable.eventID,
                timestamp: logsTable.timestamp,
                username: usersTable.username,
                description: eventsTable.description, // Fetch username instead of userID
            })
            .from(logsTable)
            .leftJoin(usersTable, eq(logsTable.userID, usersTable.id))
            .leftJoin(eventsTable, eq(logsTable.eventID, eventsTable.eventID))
            .orderBy(desc(logsTable.timestamp))
            .limit(logsPerPage)
            .offset(offset);

        // Apply filter if provided
        if (filter) {
            // @ts-ignore
            query = query.where(like(logsTable.eventID, `%${filter}%`));
        }

        const logs = await query;

        // Get total log count for pagination
        const totalLogs = await db
            .select({ count: sql`COUNT(*)`.as<number>() })
            .from(logsTable)
            .then((res) => res[0]?.count || 0);

        const totalPages = Math.ceil(totalLogs / logsPerPage);

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ logs, totalPages }, { status: 200 });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
