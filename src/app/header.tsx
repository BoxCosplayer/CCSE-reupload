// This is the code for the dynamic header displayed on every page

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [roleID, setRoleID] = useState<string | null>(null);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch("/api/auth-status");
                const data = await response.json();

                if (data.loggedIn) {
                    setIsLoggedIn(true);
                    setRoleID(data.user.roleID);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsLoggedIn(false);
            }
        };

        checkAuthStatus();
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = async () => {
        await fetch("/api/logout-user", { method: "POST" });
        setIsLoggedIn(false);
        window.location.href = "/account/login"; // Redirect after logout
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
            {/* Logo / Home */}
            <div className="text-lg font-bold">
                <Link href="..">SecureCart</Link>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
                {/* Home Button */}
                <Link href=".." className="px-4 py-2 rounded hover:bg-gray-700 transition">
                    Home
                </Link>

                {/* Role-Based Dropdown Menu (Only if logged in) */}
                {isLoggedIn && (
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="px-4 py-2 rounded hover:bg-gray-700 transition flex items-center"
                        >
                            {/* Dynamic Dropdown Title */}
                            {roleID === "b746d3c3-e78f-4ca6-9fd4-e54282fd6564"
                                ? "Seller"
                                : roleID === "dd3c917f-d074-4570-9633-acd9255d0da6"
                                    ? "Admin"
                                    : "Categories"}

                            {/* Dropdown Arrow */}
                            <svg
                                className="w-4 h-4 ml-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <ul className="absolute bg-gray-700 text-white rounded shadow-lg mt-2 w-52">
                                {roleID === "b746d3c3-e78f-4ca6-9fd4-e54282fd6564" ? (
                                    // Seller Menu
                                    <>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/seller/manage-products">Manage Products</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/seller/new-product">Create Products</Link>
                                        </li>
                                    </>
                                ) : roleID === "dd3c917f-d074-4570-9633-acd9255d0da6" ? (
                                    // Admin Menu
                                    <>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/admin/logs">System Logs</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/admin/manage-users">Manage Users</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/admin/manage-products">Manage Products</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/admin/manage-discounts">Manage Discounts</Link>
                                        </li>
                                    </>
                                ) : (
                                    // Default Category Menu (For Customers)
                                    <>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/categories/electronics">Electronics</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/categories/fashion">Fashion</Link>
                                        </li>
                                        <li className="px-4 py-2 hover:bg-gray-600">
                                            <Link href="/categories/home">Home & Living</Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                {/* Cart Button - Only Visible for Customers */}
                {isLoggedIn && roleID === "42661565-0374-48d1-9bb5-0ccf6c1d3300" && (
                    <Link href="/customer/cart" className="px-4 py-2 rounded transition hover:bg-gray-700">
                        Cart
                    </Link>
                )}

                {/* My Profile & Logout Button (Only for Logged-in Users) */}
                {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                        <Link href="/account/my-profile" className="px-4 py-2 rounded hover:bg-gray-700 transition">
                            My Profile
                        </Link>
                        <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition">
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link href="/account/login" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition">
                        Login
                    </Link>
                )}
            </nav>
        </header>
    );
}
