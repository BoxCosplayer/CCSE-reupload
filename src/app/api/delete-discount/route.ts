import { NextResponse } from "next/server";
import { db } from "@/db";
import { discountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "delete-discount";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const userID = await validateRequestOrigin(req)

        const { discountID } = await req.json();

        if (!discountID) {
            return NextResponse.json({ error: "Missing discount ID" }, { status: 400 });
        }

        // Delete discount entry
        await db.delete(discountsTable).where(eq(discountsTable.discountID, discountID));

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ message: "Discount deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting discount:", error);
        return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
    }
}
