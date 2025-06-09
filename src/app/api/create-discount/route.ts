import { NextResponse } from "next/server";
import { db } from "@/db";
import { discountsTable } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "create-discount";

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


        const data = await req.json();

        // Validate discount (must be between 1 and 99, and a whole number)
        const discountAmount = Math.floor(Number(data.amount));
        if (discountAmount < 1 || discountAmount > 99) {
            return NextResponse.json({ error: "Invalid discount percentage" }, { status: 400 });
        }

        await db.insert(discountsTable).values({
            discountID: uuidv4(),
            code: data.code,
            amount: discountAmount.toString(),
        });

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ message: "Discount created successfully!" }, { status: 201 });

    } catch (error) {
        console.error("Error creating discount:", error);
        return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
    }
}
