// This is the index page, for customers and anonymous users

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/auth-status");
        const data = await response.json();

        if (data.loggedIn) {
          if (data.user.roleID === "dd3c917f-d074-4570-9633-acd9255d0da6") {
            router.push("/admin/dashboard"); // Redirect Admins
          } else if (data.user.roleID === "b746d3c3-e78f-4ca6-9fd4-e54282fd6564") {
            router.push("/seller/dashboard"); // Redirect Sellers
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (isLoading) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          {/* Welcome Section */}
          <section className="text-center sm:text-left">
            <h1 className="text-4xl font-bold mb-4">Welcome to SecureCart</h1>
            <p className="text-lg text-gray-700">
              Your trusted platform for secure and seamless online shopping.
            </p>
          </section>

          {/* Product categories Section */}
          <section className="w-full max-w-4xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">Explore Our Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center border p-4 rounded-lg shadow">
                <Link href="/categories/electronics">
                  <Image src="/electronics.jpg" alt="Electronics" width={120} height={120} />
                </Link>
                <p className="mt-2 text-center">Electronics</p>
              </div>
              <div className="flex flex-col items-center border p-4 rounded-lg shadow">
                <Link href="/categories/fashion">
                  <Image src="/fashion.jpg" alt="Fashion" width={120} height={120} />
                </Link>
                <p className="mt-2 text-center">Fashion</p>
              </div>
              <div className="flex flex-col items-center border p-4 rounded-lg shadow">
                <Link href="/categories/home">
                  <Image src="/h&l.jpg" alt="Home & Living" width={120} height={120} />
                </Link>
                <p className="mt-2 text-center">Home & Living</p>
              </div>
            </div>
          </section>

          {/* Secure Shopping Section */}
          <section className="bg-blue-100 p-6 rounded-lg text-center w-full max-w-3xl">
            <h2 className="text-xl font-bold mb-4 text-[#0a0a0a]">Why Shop with Us?</h2>
            <p className="text-gray-700">
              At SecureCart, we prioritize your security. Enjoy encrypted transactions,
              secure authentication, and peace of mind while shopping online.
            </p>
          </section>
        </main>
      </div>
  );
}
