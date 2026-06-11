"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { expenseApprovedTemplate, expenseRejectedTemplate } from "@/lib/emailTemplates";


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
  createdById: string; // Add this line
  treasurerApproved: boolean;
  treasurerApprovedBy: string;
  treasurerApprovedAt: string;
  adminApproved: boolean;
  adminApprovedBy: string;
  adminApprovedAt: string;
}

export default function ExpenseReview() {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
const [userName, setUserName] = useState("");
const [uid, setUid] = useState("");
const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
  setUserRole(userSnap.data().role);
  setUserName(userSnap.data().name);
  setUid(user.uid);
}
        const expenseSnap = await getDoc(doc(db, "expenses", id));
        if (expenseSnap.exists()) {
          setExpense({ id: expenseSnap.id, ...expenseSnap.data() } as Expense);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // Add this helper function inside the ExpenseReview component
const sendEmailNotification = async (to: string, subject: string, html: string) => {
  try {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch (error) {
    console.error("Email notification failed", error);
  }
};

const handleApprove = async () => {
  if (!expense) return;
  setProcessing(true);

  const updates: Record<string, unknown> = {};
  const now = new Date().toISOString();

  if (userRole === "treasurer" && !expense.treasurerApproved) {
    updates.treasurerApproved = true;
    updates.treasurerApprovedBy = userName;
    updates.treasurerApprovedAt = now;
  }

  if (userRole === "admin" && !expense.adminApproved) {
    updates.adminApproved = true;
    updates.adminApprovedBy = userName;
    updates.adminApprovedAt = now;
  }

  const treasurerApproved = userRole === "treasurer" ? true : expense.treasurerApproved;
  const adminApproved = userRole === "admin" ? true : expense.adminApproved;

  if (treasurerApproved && adminApproved) {
    updates.status = "approved";
  }

  await updateDoc(doc(db, "expenses", id), updates);

  // Email Notification Logic
  if (treasurerApproved && adminApproved) {
    const creatorSnap = await getDoc(doc(db, "users", expense.createdById));
    if (creatorSnap.exists()) {
      const creatorEmail = creatorSnap.data().email;
      await sendEmailNotification(
        creatorEmail,
        "Expense Approved",
        expenseApprovedTemplate(expense.createdBy, expense.title, expense.amount)
      );
    }
  }

  const updated = await getDoc(doc(db, "expenses", id));
  setExpense({ id: updated.id, ...updated.data() } as Expense);
  
  await logAction("Expense Approved", `Expense "${expense.title}" approved`, userName, uid, "expense");
  setProcessing(false);
};


const handleReject = async () => {
  if (!expense) return;
  if (!confirm("Are you sure you want to reject this expense?")) return;
  setProcessing(true);

  // 1. Update status
  await updateDoc(doc(db, "expenses", id), {
    status: "rejected",
    rejectedBy: userName,
    rejectedAt: new Date().toISOString(),
  });

  // 2. Attempt Email Notification
  console.log("Starting rejection notification for:", expense.createdById);
  try {
    const creatorSnap = await getDoc(doc(db, "users", expense.createdById));
    if (creatorSnap.exists()) {
      const creatorEmail = creatorSnap.data().email;
      console.log("Creator email found:", creatorEmail);
      
      // Crucial: Wait for the email to send before continuing
      await sendEmailNotification(
        creatorEmail,
        "Expense Rejected",
        expenseRejectedTemplate(expense.createdBy, expense.title, expense.amount)
      );
      console.log("Rejection email sent successfully");
    } else {
      console.warn("Creator user not found in database");
    }
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }

  // 3. Log and redirect
  await logAction("Expense Rejected", `Expense "${expense.title}" rejected`, userName, uid, "expense");
  router.push("/expenses");
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Expense not found.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Review Expense</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">

          {/* Expense Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-semibold">{expense.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-red-600">৳{expense.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">{expense.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Added By</p>
              <p className="font-semibold">{expense.createdBy}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-semibold">{expense.description || "No description"}</p>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Approval Status</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">Treasurer Approval</p>
                  {expense.treasurerApproved && (
                    <p className="text-xs text-gray-400">
                      By {expense.treasurerApprovedBy} at {new Date(expense.treasurerApprovedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  expense.treasurerApproved
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {expense.treasurerApproved ? "✅ Approved" : "⏳ Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">Admin Approval</p>
                  {expense.adminApproved && (
                    <p className="text-xs text-gray-400">
                      By {expense.adminApprovedBy} at {new Date(expense.adminApprovedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  expense.adminApproved
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {expense.adminApproved ? "✅ Approved" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Final Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Final Status</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                expense.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : expense.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {expense.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {["treasurer", "admin"].includes(userRole) && expense.status === "pending" && (
            <div className="border-t pt-4 flex gap-3">
              <button
                onClick={handleApprove}
                disabled={processing ||
                  (userRole === "treasurer" && expense.treasurerApproved) ||
                  (userRole === "admin" && expense.adminApproved)
                }
                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}

          <button
            onClick={() => router.push("/expenses")}
            className="w-full border text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Back to Expenses
          </button>

        </div>
      </main>
    </ProtectedRoute>
  );
}