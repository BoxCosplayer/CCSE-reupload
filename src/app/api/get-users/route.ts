import { NextResponse } from "next/server";
import { db } from "@/db"; // Database connection
import { usersTable, rolesTable } from "@/db/schema"; // Import schema
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-users";

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const userID = await validateRequestOrigin(req)

        // Fetch all users, excluding passwords
        const users = await db
            .select({
                id: usersTable.id,
                name: usersTable.name,
                username: usersTable.username,
                roleID: usersTable.roleID,
                city: usersTable.city,
                postcode: usersTable.postcode,
                roleName: rolesTable.name,
            })
            .from(usersTable)
            .leftJoin(rolesTable, eq(usersTable.roleID, rolesTable.roleID));

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
