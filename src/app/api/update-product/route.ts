import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { productsTable } from "@/db/schema"; // Import schema
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

const EVENT_ID = "update-product";

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

        // Get form data
        const formData = await req.formData();
        const productID = formData.get("productID") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const stock = formData.get("stock") ? parseInt(formData.get("stock") as string, 10): 0;
        const image = formData.get("image") as File | null;

        if (!productID || !name || !description || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const product = await db.select().from(productsTable).where(eq(productsTable.productID, productID)).limit(1);
        let imagePath = product[0].image; // Keep existing image if no new one uploaded

        // **Handle Image Upload**
        if (image) {
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(image.type)) {
                return NextResponse.json({ error: "Invalid file type. Only JPG and PNG allowed." }, { status: 400 });
            }

            const extension = image.name.split(".").pop();
            const newFileName = `${productID}.${extension}`;
            const uploadDir = path.join(process.cwd(), "public");
            const filePath = path.join(uploadDir, newFileName);

            // Convert File to Buffer
            const buffer = Buffer.from(await image.arrayBuffer());

            // Save Image to Public Directory
            fs.writeFileSync(filePath, buffer);
            imagePath = `/uploads/${newFileName}`;
        }

        // Update Product in DB
        await db
            .update(productsTable)
            .set({
                name,
                description,
                price,
                category,
                stock,
                image: imagePath,
            })
            .where(eq(productsTable.productID, productID));

        await logEvent(userID, EVENT_ID);
        return NextResponse.json({ message: "Product updated successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
