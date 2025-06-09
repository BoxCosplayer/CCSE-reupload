import { NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable, productsTable, itemsHeldTable } from "@/db/schema"; // Ensure correct schema import
import { eq, inArray } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "delete-user";

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const actionUserID = await validateRequestOrigin(req)

        const { userID } = await req.json();

        if (!userID) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (userID == actionUserID) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }

        // Check if user exists
        const user = await db.select().from(usersTable).where(eq(usersTable.id, userID)).limit(1);
        if (user.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If the user is a seller, delete their products
        const sellerProducts = await db.select({ productID: productsTable.productID })
            .from(productsTable)
            .where(eq(productsTable.sellerID, userID));

        if (sellerProducts.length > 0) {
            const productIDs = sellerProducts.map(p => p.productID);

            // Delete all cart items containing products from this seller
            await db.delete(itemsHeldTable).where(inArray(itemsHeldTable.productID, productIDs));

            // Delete all products owned by this seller
            await db.delete(productsTable).where(eq(productsTable.sellerID, userID));
        }

        // Delete the user's cart items
        await db.delete(itemsHeldTable).where(eq(itemsHeldTable.userID, userID));

        // Delete the user
        await db.delete(usersTable).where(eq(usersTable.id, userID));

        await logEvent(actionUserID, EVENT_ID);

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}