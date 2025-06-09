// This page allows the admin user logged in to see all logs

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Define Log Entry Type
type LogEntry = {
    logID: string;
    eventID: string;
    username: string;
    timestamp: string;
    description: string;
};

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1); // Current page number
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState(""); // Filter logs by event type

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`/api/get-logs?page=${page}&filter=${filter}`);
                const data = await response.json();

                if (response.ok) {
                    setLogs(data.logs);
                    setTotalPages(data.totalPages);
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
    }, [page, filter]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold mb-6">System Logs</h1>

            {/* Filter by Event */}
            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Filter by event type..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded"
                />
                <button
                    onClick={() => setPage(1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Apply Filter
                </button>
            </div>

            {/* Logs Table */}
            <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-600">
                        <thead>
                        <tr className="bg-gray-900 text-white">
                            <th className="p-3 border border-gray-700">Event</th>
                            <th className="p-3 border border-gray-700">User</th>
                            <th className="p-3 border border-gray-700">Timestamp</th>
                            <th className="p-3 border border-gray-700">Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="text-center p-4 text-gray-300">
                                    Loading logs...
                                </td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <tr key={log.logID} className="border border-gray-700">
                                    <td className="p-3 text-center">{log.eventID}</td>
                                    <td className="p-3 text-center">{log.username}</td>
                                    <td className="p-3 text-center">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-center">{log.description}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center p-4 text-gray-300">
                                    No logs found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex gap-4">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={`px-4 py-2 ${page <= 1 ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg transition`}
                >
                    Previous
                </button>
                <span className="text-lg font-bold">Page {page} of {totalPages}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className={`px-4 py-2 ${page >= totalPages ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg transition`}
                >
                    Next
                </button>
            </div>

            {/* Back to Dashboard */}
            <div className="mt-6">
                <Link href="/admin/dashboard">
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                        Back to Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}
