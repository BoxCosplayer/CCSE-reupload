import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct database connection
import { productsTable, usersTable } from "@/db/schema"; // Import schema
import { eq } from "drizzle-orm";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "get-product";

export async function GET(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip, "/api/login")) {
        return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }

    try {
        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({error: "Unauthorized request"}, {status: 403});
        }
        const userID = await validateRequestOrigin(req)

        const { searchParams } = new URL(req.url);
        const productID = searchParams.get("productID");

        // Validate input
        if (!productID) {
            return NextResponse.json({ error: "Missing productID" }, { status: 400 });
        }

        // Fetch product data from database
        const product = await db
            .select({
                productID: productsTable.productID,
                name: productsTable.name,
                description: productsTable.description,
                image: productsTable.image,
                avgRating: productsTable.avgRating,
                stock: productsTable.stock,
                category: productsTable.category,
                price: productsTable.price,
                sellerID: productsTable.sellerID,
                sellerName: usersTable.name, // Fetch seller's name
            })
            .from(productsTable)
            .leftJoin(usersTable, eq(productsTable.sellerID, usersTable.id))
            .where(eq(productsTable.productID, productID))
            .limit(1);

        // If no product is found, return 404
        if (!product || product.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ product: product[0] }, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}
