import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { productsTable, itemsHeldTable } from "@/db/schema"; // Import schemas
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "delete-product";

// **Handle Product Deletion**
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

        if (!productID) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // **Fetch Product Info**
        const product = await db.select().from(productsTable).where(eq(productsTable.productID, productID)).limit(1);

        if (!product.length) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // **Delete Product Image (if exists)**
        if (product[0].image) {
            const imagePath = path.join(process.cwd(), "public", product[0].image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // **Delete Product from Cart (itemsHeldTable)**
        await db.delete(itemsHeldTable).where(eq(itemsHeldTable.productID, productID));

        // **Delete Product from Database**
        await db.delete(productsTable).where(eq(productsTable.productID, productID));

        await logEvent(userID, EVENT_ID);

        return NextResponse.json({ message: "Product deleted successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
