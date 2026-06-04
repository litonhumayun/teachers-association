"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RequestExpense() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [uid, setUid] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.name);
          setUserRole(data.role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !amount || !date) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "expenses"), {
        title,
        amount: Number(amount),
        date,
        description,
        status: "pending",
        isRequest: true,
        createdBy: userName,
        createdById: uid,
        createdByRole: userRole,
        createdAt: new Date().toISOString(),
        treasurerApproved: false,
        treasurerApprovedBy: "",
        treasurerApprovedAt: "",
        adminApproved: false,
        adminApprovedBy: "",
        adminApprovedAt: "",
      });
      router.push("/expenses");
    } catch {
      setError("Failed to submit request. Please try again.");
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-2">Request Expense</h1>
        <p className="text-gray-500 text-sm mb-6">
          Submit an expense request. It will be reviewed by Treasurer and Admin.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Travel Expense"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount (৳) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Explain why this expense is needed..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Your request will be reviewed by both <strong>Treasurer</strong> and <strong>Admin</strong>. You will be notified once approved.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/expenses")}
              className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>

        </form>
      </main>
    </ProtectedRoute>
  );
}