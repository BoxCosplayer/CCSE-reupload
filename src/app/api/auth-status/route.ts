import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {rateLimit} from "@/utils/apisecurity";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (!rateLimit(ip, "/api/login")) {
            return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
        }

        // Get token from cookies
        const cookieHeader = req.headers.get("cookie");
        const token = cookieHeader
            ?.split("; ")
            .find(row => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ loggedIn: false });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, SECRET_KEY);
        return NextResponse.json({ loggedIn: true, user: decoded });
    } catch (error) {
        return NextResponse.json({ loggedIn: false });
    }
}
