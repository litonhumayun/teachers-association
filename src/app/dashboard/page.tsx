"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  designation: string;
  institute: string;
  division: string;
  subject: string;
  bcsBatch: string;
  mobile: string;
  email: string;
  joiningDate: string;
  role: string;
  status: string;
  memberId: string;
}

interface Stats {
  totalMembers: number;
  totalCollection: number;
  totalExpenses: number;
  currentBalance: number;
  pendingPayments: number;
  pendingExpenses: number;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalCollection: 0,
    totalExpenses: 0,
    currentBalance: 0,
    pendingPayments: 0,
    pendingExpenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }

        // Fetch stats
        // Total active members
        const membersSnap = await getDocs(
          query(collection(db, "users"), where("status", "==", "active"))
        );
        const totalMembers = membersSnap.size;

        // Total collection (approved payments)
        const paymentsSnap = await getDocs(
          query(collection(db, "payments"), where("status", "==", "approved"))
        );
        const totalCollection = paymentsSnap.docs.reduce(
          (sum, d) => sum + d.data().amount, 0
        );

        // Pending payments
        const pendingPaymentsSnap = await getDocs(
          query(collection(db, "payments"), where("status", "==", "pending"))
        );
        const pendingPayments = pendingPaymentsSnap.size;

        // Total expenses (approved)
        const expensesSnap = await getDocs(
          query(collection(db, "expenses"), where("status", "==", "approved"))
        );
        const totalExpenses = expensesSnap.docs.reduce(
          (sum, d) => sum + d.data().amount, 0
        );

        // Pending expenses
        const pendingExpensesSnap = await getDocs(
          query(collection(db, "expenses"), where("status", "==", "pending"))
        );
        const pendingExpenses = pendingExpensesSnap.size;

        setStats({
          totalMembers,
          totalCollection,
          totalExpenses,
          currentBalance: totalCollection - totalExpenses,
          pendingPayments,
          pendingExpenses,
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        {/* Welcome Block */}
        <div className="bg-green-700 text-white rounded-lg p-5 md:p-6 mb-6 shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold">Welcome, {userData?.name}!</h1>
          <p className="text-green-100 text-xs md:text-sm mt-1 leading-relaxed">
            {userData?.designation} — {userData?.institute}
          </p>
          
          {/* Metadata badges for mobile flexibility */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-green-600 text-xs text-green-100">
            <div>
              <span className="opacity-75">Member ID:</span> <span className="font-medium">{userData?.memberId || "Pending"}</span>
            </div>
            <div>
              <span className="opacity-75">Role:</span> <span className="font-medium capitalize">{userData?.role}</span>
            </div>
            <div>
              <span className="opacity-75">Status:</span> <span className="font-medium capitalize">{userData?.status}</span>
            </div>
          </div>
        </div>

        {/* Pending Approval Warning */}
        {userData?.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-4 mb-6">
            <p className="font-semibold text-sm flex items-center gap-1.5">
              <span>⏳</span> Your account is pending approval.
            </p>
            <p className="text-xs mt-0.5 ml-5 text-yellow-700">
              Please wait for an admin to approve your account profile.
            </p>
          </div>
        )}

        {/* Financial Stats */}
        <h2 className="text-sm md:text-base font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Association Finance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Total Collection</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 mt-0.5">
              ৳{stats.totalCollection.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-0.5">
              ৳{stats.totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Current Balance</p>
            <p className={`text-xl md:text-2xl font-bold mt-0.5 ${
              stats.currentBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              ৳{stats.currentBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Member & Pending Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Total Members</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600 mt-0.5">
              {stats.totalMembers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Pending Payments</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-0.5">
              {stats.pendingPayments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">Pending Expenses</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-0.5">
              {stats.pendingExpenses}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <h2 className="text-sm md:text-base font-bold text-gray-700 mb-3 uppercase tracking-wider">
          My Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">Division</span>
            <span className="font-semibold text-sm text-gray-800 mt-0.5 block">{userData?.division || "—"}</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">Subject</span>
            <span className="font-semibold text-sm text-gray-800 mt-0.5 block">{userData?.subject || "—"}</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">BCS Batch</span>
            <span className="font-semibold text-sm text-gray-800 mt-0.5 block">
              {userData?.bcsBatch === "00" ? "No BCS" : `${userData?.bcsBatch}th BCS`}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">Mobile</span>
            <span className="font-semibold text-sm text-gray-800 mt-0.5 block">{userData?.mobile || "—"}</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">Joining Date</span>
            <span className="font-semibold text-sm text-gray-800 mt-0.5 block">{userData?.joiningDate || "—"}</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3.5 overflow-hidden">
            <span className="text-[10px] md:text-xs text-gray-400 font-semibold block uppercase tracking-wider">Email</span>
            <span className="font-semibold text-xs md:text-sm text-gray-800 mt-0.5 block truncate" title={userData?.email}>
              {userData?.email || "—"}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-sm md:text-base font-bold text-gray-700 mb-3 uppercase tracking-wider">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <Link
            href="/payments"
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center hover:shadow-md active:scale-[0.98] transition block"
          >
            <p className="text-xl md:text-2xl mb-1">💳</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700">Payments</p>
          </Link>
          <Link
            href="/expenses"
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center hover:shadow-md active:scale-[0.98] transition block"
          >
            <p className="text-xl md:text-2xl mb-1">💰</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700">Expenses</p>
          </Link>
          <Link
            href="/notices"
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center hover:shadow-md active:scale-[0.98] transition block"
          >
            <p className="text-xl md:text-2xl mb-1">📢</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700">Notices</p>
          </Link>
          <Link
            href="/documents"
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center hover:shadow-md active:scale-[0.98] transition block"
          >
            <p className="text-xl md:text-2xl mb-1">📄</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700">Documents</p>
          </Link>
        </div>

      </main>
    </ProtectedRoute>
  );
}