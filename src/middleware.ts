// This file is run BEFORE every page is loaded
// This is responsible for re-routing users away from sites / pages they do not have access to

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// Role IDs
const ADMIN_ROLE_ID = "dd3c917f-d074-4570-9633-acd9255d0da6";
const SELLER_ROLE_ID = "b746d3c3-e78f-4ca6-9fd4-e54282fd6564";
const CUSTOMER_ROLE_ID = "42661565-0374-48d1-9bb5-0ccf6c1d3300";

export async function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value;


    if (!token) {
       return NextResponse.redirect(new URL("/account/login", req.url));
    }


    const { payload } = await jose.jwtVerify(token, SECRET_KEY);

    try {

        console.log("Ran function")

        const userRole = payload.roleID;

        // Protect /admin/* pages - Only Admins allowed
        if (req.nextUrl.pathname.startsWith("/admin") && userRole !== ADMIN_ROLE_ID) {
            console.log("Unauth admin")
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protect /seller/* pages - Only Sellers allowed
        if (req.nextUrl.pathname.startsWith("/seller") && userRole !== SELLER_ROLE_ID) {
            console.log("Unauth seller")
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protect /categories/* pages - Only Customers allowed
        if (req.nextUrl.pathname.startsWith("/categories") && userRole !== CUSTOMER_ROLE_ID) {
            console.log("Unauth category")
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next(); // Allow access if authorized
    } catch (error) {
        console.error("JWT Verification Failed:", error);
        console.log("YOO")
        return NextResponse.redirect(new URL("/", req.url));
    }
}

// Apply middleware to all /admin/* and /seller/* routes
export const config = {
    matcher: ["/admin/:path*", "/seller/:path*", "/categories/:path*"],
};