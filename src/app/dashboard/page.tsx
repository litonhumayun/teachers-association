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
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="bg-green-700 text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold">Welcome, {userData?.name}!</h1>
          <p className="text-green-200 mt-1">
            {userData?.designation} — {userData?.institute}
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-green-200 text-sm">
              Member ID: {userData?.memberId || "Pending"}
            </span>
            <span className="text-green-200 text-sm">
              Role: {userData?.role}
            </span>
            <span className="text-green-200 text-sm">
              Status: {userData?.status}
            </span>
          </div>
        </div>

        {/* Pending Approval Warning */}
        {userData?.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-4 mb-6">
            <p className="font-medium">⏳ Your account is pending approval.</p>
            <p className="text-sm mt-1">
              Please wait for an admin to approve your account.
            </p>
          </div>
        )}

        {/* Financial Stats */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Association Finance
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Collection</p>
            <p className="text-2xl font-bold text-green-600">
              ৳{stats.totalCollection.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              ৳{stats.totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className={`text-2xl font-bold ${
              stats.currentBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              ৳{stats.currentBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Member & Pending Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalMembers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingPayments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Pending Expenses</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingExpenses}
            </p>
          </div>
        </div>

        {/* Personal Info */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          My Information
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Division</p>
            <p className="font-semibold text-gray-700">{userData?.division}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="font-semibold text-gray-700">{userData?.subject}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">BCS Batch</p>
            <p className="font-semibold text-gray-700">
              {userData?.bcsBatch === "00" ? "No BCS" : `${userData?.bcsBatch}th BCS`}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="font-semibold text-gray-700">{userData?.mobile}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Joining Date</p>
            <p className="font-semibold text-gray-700">{userData?.joiningDate}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-gray-700 text-sm">{userData?.email}</p>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Quick Links
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <Link
            href="/payments"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition"
          >
            <p className="text-2xl mb-1">💳</p>
            <p className="text-sm font-medium text-gray-700">Payments</p>
          </Link>
          <Link
            href="/expenses"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition"
          >
            <p className="text-2xl mb-1">💰</p>
            <p className="text-sm font-medium text-gray-700">Expenses</p>
          </Link>
          <Link
            href="/notices"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition"
          >
            <p className="text-2xl mb-1">📢</p>
            <p className="text-sm font-medium text-gray-700">Notices</p>
          </Link>
          <Link
            href="/documents"
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition"
          >
            <p className="text-2xl mb-1">📄</p>
            <p className="text-sm font-medium text-gray-700">Documents</p>
          </Link>
        </div>

      </main>
    </ProtectedRoute>
  );
}