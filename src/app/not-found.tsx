// This is the 404 page
// All 404 errors are redirected to each users' designated landing page for security reasons
//
// Each page that exists but does not exist behaves in this way, so for an unauthorised user,
// they won't be able to tell the difference from a page that requires access and a page that doesn't exist

import { redirect } from "next/navigation";

export default function NotFound() {
    redirect("/"); // Redirect all 404 pages to "/"
}