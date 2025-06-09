import { NextResponse } from "next/server";
import { db } from "@/db";
import { discountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-discounts";

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

        const { code } = await req.json();

        const discount = await db.select().from(discountsTable).where(eq(discountsTable.code, code)).limit(1);

        if (!discount.length) {
            return NextResponse.json({ error: "Invalid discount code" }, { status: 400 });
        }

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ discount: Number(discount[0].amount) }, { status: 200 });
    } catch (error) {
        console.error("Error fetching discount:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
