"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALLOWED_ROLES = ["treasurer", "secretary", "president", "admin"];

export default function AddExpense() {
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
          if (!ALLOWED_ROLES.includes(data.role)) {
            router.push("/expenses");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

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
        isRequest: false,
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
      setError("Failed to add expense. Please try again.");
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Add Expense</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Office Rent"
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional details..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This expense requires approval from both <strong>Treasurer</strong> and <strong>Admin</strong> before it is finalized.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Expense"}
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