import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct database connection
import { productsTable, usersTable } from "@/db/schema"; // Import schema
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-products";

export async function GET(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip, "/api/login")) {
        return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }

    if (!await validateRequestOrigin(req)) {
        return NextResponse.json({error: "Unauthorized request"}, {status: 403});
    }
    const userID = await validateRequestOrigin(req)

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    try {
        const query = db
            .select({
                productID: productsTable.productID,
                name: productsTable.name,
                image: productsTable.image,
                avgRating: productsTable.avgRating,
                stock: productsTable.stock,
                category: productsTable.category,
                price: productsTable.price,
                sellerID: productsTable.sellerID,
                sellerName: usersTable.name, // Fetch seller's name instead of ID
            })
            .from(productsTable)
            .leftJoin(usersTable, eq(productsTable.sellerID, usersTable.id)); // Join with users table

        // Apply category filter only if it's NOT "all"
        const products =
            category.toLowerCase() === "all"
                ? await query
                : await query.where(eq(productsTable.category, category));

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
