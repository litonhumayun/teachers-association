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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
// Close mobile menu on route change
useEffect(() => {
  const timer = setTimeout(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, 0);
  return () => clearTimeout(timer);
}, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="bg-green-700 text-white py-4 px-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="hover:opacity-90">
          <h1 className="text-base font-bold leading-tight max-w-xs">
            BCS Non-Cadre TSC Teachers&apos; Association
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-3 items-center">
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
                        <Link href="/payments" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">💳 Payments</Link>
                        <Link href="/expenses" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">💰 Expenses</Link>
                        <Link href="/documents" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">📄 Documents</Link>
                        <Link href="/transfer" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">🔄 Transfer</Link>
                        {["admin", "treasurer", "president"].includes(userData?.role || "") && (
                          <Link href="/audit" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">📋 Audit Log</Link>
                        )}
                      </div>
                    )}
                  </div>

                  <Link href="/dashboard" className="hover:underline text-sm">Dashboard</Link>
                  <Link href="/profile" className="hover:underline text-sm">Profile</Link>
                  {userData?.role === "admin" && (
                    <Link href="/admin" className="hover:underline text-sm font-medium text-yellow-300">Admin</Link>
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
                      <Link href="/login" className="bg-white text-green-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-50 transition">Login</Link>
                      <Link href="/register" className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-500 transition border border-white">Register</Link>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 border-t border-green-600 pt-4 space-y-2">
          <Link href="/" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Home</Link>
          <Link href="/notices" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Notices</Link>

          {!loading && (
            <>
              {loggedIn ? (
                <>
                  <Link href="/members" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Members</Link>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Dashboard</Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Profile</Link>
                  <Link href="/payments" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">💳 Payments</Link>
                  <Link href="/expenses" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">💰 Expenses</Link>
                  <Link href="/documents" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">📄 Documents</Link>
                  <Link href="/transfer" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">🔄 Transfer</Link>
                  {["admin", "treasurer", "president"].includes(userData?.role || "") && (
                    <Link href="/audit" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">📋 Audit Log</Link>
                  )}
                  {userData?.role === "admin" && (
                    <Link href="/admin" className="block px-4 py-2 text-sm font-medium text-yellow-300 hover:bg-green-600 rounded-lg">Admin Panel</Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-green-600 rounded-lg text-red-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {!isAuthPage && (
                    <>
                      <Link href="/login" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Login</Link>
                      <Link href="/register" className="block px-4 py-2 text-sm hover:bg-green-600 rounded-lg">Register</Link>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}