import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct database connection
import { itemsHeldTable } from "@/db/schema"; // Import schema
import { eq, and } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "buy-product";

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip, "/api/login")) {
        return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }

    try {
        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }

        const { userID, productID } = await req.json();

        // Validate input
        if (!userID || !productID) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if the product already exists in the cart
        const existingItem = await db
            .select()
            .from(itemsHeldTable)
            .where(and(eq(itemsHeldTable.userID, userID), eq(itemsHeldTable.productID, productID)))
            .limit(1);

        if (existingItem.length > 0) {
            return NextResponse.json({ error: "Item already in cart" }, { status: 409 });
        }

        // Insert the product into the cart
        await db.insert(itemsHeldTable).values({
            cartID: crypto.randomUUID(), // Generate a unique cart ID
            userID,
            productID,
            amount: 1, // Default quantity
        });

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ message: "Item added to cart successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error while adding item to cart:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
