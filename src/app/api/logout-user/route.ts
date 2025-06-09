import { NextResponse } from "next/server";

import {logEvent, rateLimit, validateRequestOrigin} from "@/utils/apisecurity";

// Event ID for this API
const EVENT_ID = "logout-user";

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!rateLimit(ip, "/api/login")) {
        return NextResponse.json({ error: "Too many requests, slow down!" }, { status: 429 });
    }

    if (!await validateRequestOrigin(req)) {
        return NextResponse.json({error: "Unauthorized request"}, {status: 403});
    }
    const userID = await validateRequestOrigin(req)

    const response = NextResponse.json({ message: "Logged out" });

    response.cookies.delete("token"); // Deletes Session Cookie

    await logEvent(userID, EVENT_ID);

    return response;
}