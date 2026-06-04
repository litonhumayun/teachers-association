"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface UserData {
  role: string;
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      } else {
        setLoggedIn(false);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="bg-green-700 text-white py-4 px-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">

        {/* Left: Logo */}
        <Link href="/" className="hover:opacity-90">
          <h1 className="text-lg font-bold">BCS Non-Cadre TSC Teachers&apos; Association</h1>
        </Link>

        {/* Right: Nav links */}
        <nav className="flex gap-3 items-center">
          <Link href="/" className="hover:underline text-sm">Home</Link>
          <Link href="/notices" className="hover:underline text-sm">Notices</Link>

          {!loading && (
            <>
              {loggedIn ? (
                <>
                  <Link href="/members" className="hover:underline text-sm">Members</Link>

                  {/* More Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="hover:underline text-sm flex items-center gap-1"
                    >
                      More ▾
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg py-2 z-50">
                        <Link
                          href="/payments"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          💳 Payments
                        </Link>
                        <Link
                          href="/expenses"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          💰 Expenses
                        </Link>
                        <Link
  href="/transfer"
  onClick={() => setDropdownOpen(false)}
  className="block px-4 py-2 text-sm hover:bg-gray-50"
>
  🔄 Transfer
</Link>
                        <Link
                          href="/documents"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          📄 Documents
                        </Link>
                        {["admin", "treasurer", "president"].includes(userData?.role || "") && (
                          <Link
                            href="/audit"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            📋 Audit Log
                          </Link>
                          
                          
                        )}
                      </div>
                    )}
                  </div>

                  <Link href="/dashboard" className="hover:underline text-sm">Dashboard</Link>
                  <Link href="/profile" className="hover:underline text-sm">Profile</Link>

                  {userData?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="hover:underline text-sm font-medium text-yellow-300"
                    >
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="bg-white text-green-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {!isAuthPage && (
                    <>
                      <Link
                        href="/login"
                        className="bg-white text-green-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50 transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-500 transition border border-white"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}