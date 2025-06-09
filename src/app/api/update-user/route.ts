import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {NextResponse} from "next/server";

import { hashPassword } from "@/utils/password-security";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";


const EVENT_ID = "update-user";

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



        const data = await req.json();
        console.log("Received Data:", data); // Log request payload

        if (!data.name) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }



        const hashedPassword = await hashPassword(data.password, data.id);

        // Simulating Database Update
        const updatedUser = await db
            .update(usersTable)
            .set({
                name: data.name,
                username: data.username,
                password: hashedPassword ? hashedPassword : undefined,
                addLine1: data.addLine1,
                addLine2: data.addLine2 || null,
                addLine3: data.addLine3 || null,
                city: data.city,
                postcode: data.postcode,
            })
            .where(eq(usersTable.id, data.id))
            .returning();

        console.log("Updated User:", updatedUser); // Log the updated user

        await logEvent(userID, EVENT_ID);

        return new Response(JSON.stringify({ message: "User updated successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
