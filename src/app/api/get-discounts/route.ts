import { NextResponse } from "next/server";
import { db } from "@/db";
import { discountsTable } from "@/db/schema";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-discounts";

export async function GET(req:Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const userID = await validateRequestOrigin(req)

        const discounts = await db.select().from(discountsTable);

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ discounts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}
