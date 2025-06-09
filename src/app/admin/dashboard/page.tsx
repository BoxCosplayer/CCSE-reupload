// This is the Admin's Landing page

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define Log Entry Type
type LogEntry = {
    logID: string;
    eventID: string;
    userID: string;
    timestamp: string;
};

export default function AdminDashboard() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth")
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                } else {
                    window.location.href = "/account/login"; // Redirect if not logged in
                }
            });

        const fetchLogs = async () => {
            try {
                const response = await fetch("/api/get-logs");

                // Check if response is valid JSON before parsing
                const textData = await response.text();
                console.log("Raw API Response:", textData); // ✅ Debugging

                // Try parsing JSON
                const data = JSON.parse(textData);

                if (response.ok && data.logs) {
                    setLogs(data.logs.slice(0, 10)); // Show latest 5 logs
                } else {
                    console.error("Failed to fetch logs:", data.error);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setIsLoading(false);
            }
        };


        fetchLogs();
    }, []);

    fetch("/api/get-logs")
        .then(res => res.text())
        .then(console.log)


    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="flex flex-wrap justify-center gap-8">
                {/* Logs Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[700px] h-[500px] flex flex-col">
                    <h2 className="text-xl font-bold text-center mb-4">Logs</h2>

                    {/* Expanded log display area */}
                    <div className="bg-gray-700 p-4 rounded-md h-[400px] overflow-y-auto flex-grow">
                        {isLoading ? (
                            <p className="text-gray-400">Loading logs...</p>
                        ) : logs.length > 0 ? (
                            logs.slice(0, 20).map((log) => ( // Show max 20 logs
                                <p key={log.logID} className="text-gray-300 text-sm mb-2">
                                    Event: {log.eventID} | User: {log.userID} | Time: {new Date(log.timestamp).toLocaleString()}
                                </p>
                            ))
                        ) : (
                            <p className="text-gray-400">No logs available.</p>
                        )}
                    </div>

                    {/* "View All" button fully inside the box */}
                    <button
                        onClick={() => router.push("/admin/logs")}
                        className="mt-4 w-full bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition"
                    >
                        View All
                    </button>
                </div>


                {/* Admin Actions */}
                <div className="flex flex-col gap-4">
                    <Link href="/admin/manage-users">
                        <button className="w-60 bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition">
                            Add Users
                        </button>
                    </Link>

                    <Link href="/admin/manage-users">
                        <button className="w-60 bg-red-600 py-3 text-white font-bold rounded hover:bg-red-700 transition">
                            Remove / Edit Users
                        </button>
                    </Link>

                    <Link href="/admin/manage-products">
                        <button className="w-60 bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition">
                            Manage Products
                        </button>
                    </Link>

                    <Link href="/admin/manage-discounts">
                        <button className="w-60 bg-blue-600 py-3 text-white font-bold rounded hover:bg-blue-700 transition">
                            Manage Discounts
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
