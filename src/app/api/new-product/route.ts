import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure correct DB connection
import { productsTable } from "@/db/schema"; // Import schema
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "new-product";

// Handles Product Creation
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        if (!await validateRequestOrigin(req)) {
            return NextResponse.json({ error: "Unauthorized request" }, { status: 403 });
        }
        const userID = await validateRequestOrigin(req);

        // Extract form data
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const stock = formData.get("stock") ? parseInt(formData.get("stock") as string, 10) : 0;
        const image = formData.get("image") as File | null;
        const sellerID = formData.get("sellerID") as string;

        if (!name || !description || !price || !category || !sellerID) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Handle Image Upload
        let imagePath = "/placeholder-product.jpg"; // Default image if no image uploaded

        if (image) {
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(image.type)) {
                return NextResponse.json({ error: "Invalid file type. Only JPG and PNG allowed." }, { status: 400 });
            }

            const extension = image.name.split(".").pop();
            const newFileName = `${uuidv4()}.${extension}`;
            const uploadDir = path.join(process.cwd(), "public/uploads");
            const filePath = path.join(uploadDir, newFileName);

            // Convert File to Buffer
            const buffer = Buffer.from(await image.arrayBuffer());

            // Ensure upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Save Image to Public Directory
            fs.writeFileSync(filePath, buffer);
            imagePath = `/uploads/${newFileName}`;
        }

        // Insert Product into DB
        await db.insert(productsTable).values({
            productID: uuidv4(),
            name,
            description,
            price,
            category,
            stock,
            sellerID,
            image: imagePath,
            avgRating: "0",
        });

        await logEvent(userID, EVENT_ID);
        return NextResponse.json({ message: "Product created successfully!" }, { status: 201 });

    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}