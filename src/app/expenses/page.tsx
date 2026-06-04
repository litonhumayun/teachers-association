"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  isRequest: boolean;
  createdBy: string;
  createdAt: string;
  treasurerApproved: boolean;
  treasurerApprovedBy: string;
  treasurerApprovedAt: string;
  adminApproved: boolean;
  adminApprovedBy: string;
  adminApprovedAt: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchExpenses = async () => {
    const q = query(collection(db, "expenses"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setExpenses(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      }
      await fetchExpenses();
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = expenses.filter((e) => {
    if (filter === "all") return true;
    if (filter === "approved") return e.status === "approved";
    if (filter === "pending") return e.status === "pending";
    if (filter === "requests") return e.isRequest === true;
    return true;
  });

  const totalApproved = expenses
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

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
          <div>
            <h1 className="text-2xl font-bold text-green-700">Expenses</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} records found</p>
          </div>
          <div className="flex gap-3">
            {["treasurer", "secretary", "president", "admin"].includes(userRole) && (
              <Link
                href="/expenses/add"
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
              >
                + Add Expense
              </Link>
            )}
            {userRole === "member" && (
              <Link
                href="/expenses/request"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                + Request Expense
              </Link>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">৳{totalApproved.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {expenses.filter((e) => e.status === "approved").length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {expenses.filter((e) => e.status === "pending").length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "approved", "pending", "requests"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                filter === f
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No expenses found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  {["treasurer", "admin"].includes(userRole) && (
                    <th className="px-4 py-3 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense) => (
                  <tr key={expense.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{expense.date}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{expense.title}</p>
                      {expense.description && (
                        <p className="text-xs text-gray-400">{expense.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-red-600">
                      ৳{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        expense.isRequest
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {expense.isRequest ? "Request" : "Direct"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        expense.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : expense.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{expense.createdBy}</td>
                    {["treasurer", "admin"].includes(userRole) && (
                      <td className="px-4 py-3">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="text-green-700 text-xs font-medium hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}