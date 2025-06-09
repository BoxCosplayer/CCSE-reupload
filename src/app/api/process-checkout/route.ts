import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { itemsHeldTable, productsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "process-checkout";

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

        // Fetch all cart items
        const cartItems = await db
            .select({
                productID: itemsHeldTable.productID,
                amount: itemsHeldTable.amount,
            })
            .from(itemsHeldTable)
            .where(eq(itemsHeldTable.userID, userID));

        if (cartItems.length === 0) {
            return NextResponse.json({ message: "No items in cart" }, { status: 400 });
        }

        // Reduce stock for each product
        for (const item of cartItems) {
            const product = await db
                .select({ stock: productsTable.stock })
                .from(productsTable)
                .where(eq(productsTable.productID, item.productID))
                .limit(1);

            if (!product.length) {
                console.error(`Product ${item.productID} not found`);
                continue;
            }

            const newStock = product[0].stock - item.amount;
            if (newStock < 0) {
                console.error(`Not enough stock for product ${item.productID}`);
                continue;
            }

            // Update stock in DB
            await db
                .update(productsTable)
                .set({ stock: newStock })
                .where(eq(productsTable.productID, item.productID));
        }

        // Clear the user's cart after checkout
        await db.delete(itemsHeldTable).where(eq(itemsHeldTable.userID, userID));

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ message: "Checkout successful!" }, { status: 200 });
    } catch (error) {
        console.error("Checkout failed:", error);
        return NextResponse.json({ error: "Checkout process failed" }, { status: 500 });
    }
}
