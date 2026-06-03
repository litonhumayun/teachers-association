"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <header className="bg-green-700 text-white py-4 px-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link href="/" className="hover:opacity-90">
          <h1 className="text-lg font-bold">BCS Non-Cadre TSC Teachers&apos; Association</h1>
        </Link>
        <nav className="flex gap-3 items-center">
          <Link href="/" className="hover:underline text-sm">Home</Link>
          <Link href="/notices" className="hover:underline text-sm">Notices</Link>

          {!loading && (
            <>
              {loggedIn ? (
                <>
                  <Link href="/members" className="hover:underline text-sm">Members</Link>
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