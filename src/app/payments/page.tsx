"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  memberId: string;
  type: "subscription" | "donation";
  amount: number;
  month: string;
  method: string;
  transactionId: string;
  status: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
}

interface UserData {
  uid: string;
  name: string;
  memberId: string;
  role: string;
  status: string;
}

const SUBSCRIPTION_START = "2026-04";

function getMonthsBetween(start: string, end: string) {
  const months = [];
  const startDate = new Date(start + "-01");
  const endDate = new Date(end + "-01");
  while (startDate <= endDate) {
    months.push(startDate.toISOString().slice(0, 7));
    startDate.setMonth(startDate.getMonth() + 1);
  }
  return months;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const months = getMonthsBetween(SUBSCRIPTION_START, currentMonth);
  const [donationSettings, setDonationSettings] = useState({
  donationActive: false,
  donationAmount: 0,
  donationTitle: "",
});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }

        // Fetch own payments
        const myPaymentsQuery = query(
          collection(db, "payments"),
          where("userId", "==", user.uid)
        );
        const mySnap = await getDocs(myPaymentsQuery);
        setPayments(mySnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment)));

        // Fetch all payments
        const allSnap = await getDocs(collection(db, "payments"));
        const allData = allSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
        allData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllPayments(allData);

        // Fetch donation settings
const donationSnap = await getDoc(doc(db, "settings", "donation"));
if (donationSnap.exists()) {
  const data = donationSnap.data();
  setDonationSettings({
    donationActive: data.donationActive || false,
    donationAmount: data.donationAmount || 0,
    donationTitle: data.donationTitle || "",
  });
}
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getMonthStatus = (month: string) => {
    const payment = payments.find(
      (p) => p.month === month && p.type === "subscription"
    );
    if (!payment) return { status: "due", payment: null };
    return { status: payment.status, payment };
  };

  const totalPaid = payments
    .filter((p) => p.status === "approved" && p.type === "subscription")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDue = months.filter(
    (m) => getMonthStatus(m).status === "due"
  ).length * 100;

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

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Payments</h1>
          {["treasurer", "admin"].includes(userData?.role || "") && (
            <Link
              href="/payments/verify"
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
            >
              Verify Payments
            </Link>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">৳{totalPaid}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Total Due</p>
            <p className="text-2xl font-bold text-red-600">৳{totalDue}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-500">Months Due</p>
            <p className="text-2xl font-bold text-yellow-600">
              {months.filter((m) => getMonthStatus(m).status === "due").length}
            </p>
          </div>
        </div>
{/* Donation Banner */}
{donationSettings.donationActive && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-blue-800">
          🎁 {donationSettings.donationTitle}
        </h2>
        <p className="text-sm text-blue-600 mt-1">
          A donation of <strong>৳{donationSettings.donationAmount}</strong> is currently active.
        </p>
      </div>
      <Link
        href={`/payments/donate`}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        Donate Now
      </Link>
    </div>
  </div>
)}
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "my"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            My Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "all"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            All Payments
          </button>
        </div>

        {/* My Subscriptions */}
        {activeTab === "my" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Transaction ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => {
                  const { status, payment } = getMonthStatus(month);
                  return (
                    <tr key={month} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {new Date(month + "-01").toLocaleDateString("en-BD", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">৳100</td>
                      <td className="px-4 py-3">{payment?.method || "-"}</td>
                      <td className="px-4 py-3">{payment?.transactionId || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          status === "approved"
                            ? "bg-green-100 text-green-700"
                            : status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {status === "due" ? "Due" : status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {status === "due" && (
                          <Link
                            href={`/payments/pay?month=${month}`}
                            className="bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition"
                          >
                            Pay Now
                          </Link>
                        )}
                        {status === "pending" && (
                          <span className="text-xs text-yellow-600">Awaiting verification</span>
                        )}
                        {status === "approved" && (
                          <span className="text-xs text-green-600">✅ Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* All Payments */}
        {activeTab === "all" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {allPayments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No payments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Member</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((payment) => (
                    <tr key={payment.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{payment.userName}</td>
                      <td className="px-4 py-3 capitalize">{payment.type}</td>
                      <td className="px-4 py-3">
                        {payment.month ? new Date(payment.month + "-01").toLocaleDateString("en-BD", {
                          month: "long",
                          year: "numeric",
                        }) : "-"}
                      </td>
                      <td className="px-4 py-3">৳{payment.amount}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          payment.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </main>
    </ProtectedRoute>
  );
}