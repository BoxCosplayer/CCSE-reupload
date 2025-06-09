import { NextResponse } from "next/server";
import { db } from "@/db"; // Your database connection
import { itemsHeldTable, productsTable, usersTable } from "@/db/schema"; // Import schemas
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-cart-items";

// API handler for GET /api/get-cart-items
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

        if (!userID) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        // Fetch items from the itemsHeldTable for the logged-in user
        const items = await db
            .select({
                productID: itemsHeldTable.productID,
                amount: itemsHeldTable.amount,
                name: productsTable.name,
                image: productsTable.image,
                avgRating: productsTable.avgRating,
                sellerName: usersTable.name,
                price: productsTable.price,
                stock: productsTable.stock,
            })
            .from(itemsHeldTable)
            .leftJoin(productsTable, eq(itemsHeldTable.productID, productsTable.productID)) // Join products table
            .leftJoin(usersTable, eq(productsTable.sellerID, usersTable.id)) // Join users table for seller info
            .where(eq(itemsHeldTable.userID, userID)); // Filter by logged-in user ID

        console.log("Cart API Response:", items);

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ cartItems: items }, { status: 200 });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 });
    }
}
