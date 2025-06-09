import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this points to your Drizzle DB connection
import { usersTable } from "@/db/schema"; // Your Drizzle schema
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';
import {config} from "dotenv";
config({ path: '.env' });

import { verifyPassword } from "@/utils/password-security";
import {logEvent, rateLimit} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "verify-user";

const SECRET_KEY = process.env.JWT_SECRET || ""; // Fallback to prevent undefined error


export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        const { username, password } = await req.json();

        // Validate input fields
        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        // Check if user exists in the database
        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, username))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        // Verify password (No hashing for now)
        const isValid = await verifyPassword(password, user[0].password, user[0].id);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        // Generate JWT Token (valid for 7 days)
        const token = jwt.sign(
            { userID: user[0].id, roleID: user[0].roleID },
            SECRET_KEY,
            { expiresIn: "7d" }
        );

        // Set JWT token in an HTTP-Only Cookie
        const response = NextResponse.json({
            message: "Login successful",
            userID: user[0].id,
            roleID: user[0].roleID,
            token,
        });

        response.cookies.set("token", token, {
            httpOnly: true, // Prevents JavaScript access (secure)
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            path: "/", // Available across the entire website
            maxAge: 60 * 60 * 24 * 7, // 7 days expiration
        });

        await logEvent(user[0].id, EVENT_ID);

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
