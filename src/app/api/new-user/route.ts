import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this points to your Drizzle DB connection
import { usersTable } from "@/db/schema"; // Your Drizzle schema
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/utils/password-security";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.name || !data.username || !data.password || !data.addLine1 || !data.city || !data.postcode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let roleID = "";

        // Convert role from text into roleIDs
        if (data.role == "admin") {
            roleID = "dd3c917f-d074-4570-9633-acd9255d0da6";
        } else if (data.role == "seller") {
            roleID = "b746d3c3-e78f-4ca6-9fd4-e54282fd6564";
        } else if (data.role == "customer") {
            roleID = "42661565-0374-48d1-9bb5-0ccf6c1d3300";
        } else {
            return NextResponse.json({ error: "Invalid Role" }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, data.username))
            .limit(1);

        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        const userID = nanoid();

        const hashedPassword = await hashPassword(data.password, userID);

        // Insert new user into the database
        await db.insert(usersTable).values({
            id: userID,
            name: data.name,
            username: data.username,
            password: hashedPassword,
            roleID: roleID,
            addLine1: data.addLine1,
            addLine2: data.addLine2 || null,
            addLine3: data.addLine3 || null,
            city: data.city,
            postcode: data.postcode,
        });

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });

    } catch (error) {
        console.error("Error creating new user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
