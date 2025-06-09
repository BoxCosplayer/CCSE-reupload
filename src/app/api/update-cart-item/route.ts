import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { itemsHeldTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "update-cart-item";

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

        const { productID, amount } = await req.json();

        // Ensure productID and amount are provided
        if (!productID || amount === undefined) {
            return NextResponse.json({ error: "Missing productID or amount" }, { status: 400 });
        }

        if (amount <= 0) {
            // Remove the item from the cart if amount is 0 or negative
            await db
                .delete(itemsHeldTable)
                .where(and(eq(itemsHeldTable.userID, userID), eq(itemsHeldTable.productID, productID)));

            return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
        }

        // Update quantity in the cart
        await db
            .update(itemsHeldTable)
            .set({ amount })
            .where(and(eq(itemsHeldTable.userID, userID), eq(itemsHeldTable.productID, productID)));


        await logEvent(userID, EVENT_ID);
        return NextResponse.json({ message: "Cart item updated" }, { status: 200 });
    } catch (error) {
        console.error("Error updating cart item:", error);
        return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
    }
}
