import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this path is correct
import { usersTable } from "@/db/schema"; // Your Drizzle schema
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

const EVENT_ID = "get-user-GET";

export async function GET(req:Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip, "/api/login")) {
        return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }

    try {
        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const userID = await validateRequestOrigin(req)

        // Extract the userID from the query params
        const { searchParams } = new URL(req.url);
        const requestedUserID = searchParams.get("userID");

        let user = await db.select().from(usersTable).where(eq(usersTable.id, userID)).limit(1);

        if (requestedUserID) {
            user = await db.select().from(usersTable).where(eq(usersTable.id, requestedUserID)).limit(1);
        }


        if (user.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await logEvent(userID, EVENT_ID);

        return NextResponse.json(user[0], { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}