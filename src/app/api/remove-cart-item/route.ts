import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { itemsHeldTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "remove-cart-item";

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

        const { productID } = await req.json();

        // Ensure productID is provided
        if (!productID) {
            return NextResponse.json({ error: "Missing productID" }, { status: 400 });
        }

        // Delete the product from the cart for the given user
        await db
            .delete(itemsHeldTable)
            .where(and(eq(itemsHeldTable.userID, userID), eq(itemsHeldTable.productID, productID)));


        await logEvent(userID, EVENT_ID);
        return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
    } catch (error) {
        console.error("Error removing cart item:", error);
        return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
    }
}
