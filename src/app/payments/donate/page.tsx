"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  uid: string;
  name: string;
  memberId: string;
  role: string;
}

interface DonationSettings {
  donationActive: boolean;
  donationAmount: number;
  donationTitle: string;
}

export default function DonatePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [donationSettings, setDonationSettings] = useState<DonationSettings | null>(null);
  const [method, setMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserData({ uid: user.uid, ...userSnap.data() } as UserData);
        }
        const donationSnap = await getDoc(doc(db, "settings", "donation"));
        if (donationSnap.exists()) {
          const data = donationSnap.data();
          if (!data.donationActive) {
            router.push("/payments");
            return;
          }
          setDonationSettings(data as DonationSettings);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!method || !transactionId) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "payments"), {
        userId: userData?.uid,
        userName: userData?.name,
        memberId: userData?.memberId,
        type: "donation",
        amount: donationSettings?.donationAmount,
        donationTitle: donationSettings?.donationTitle,
        month: "",
        method,
        transactionId,
        status: "pending",
        approvedBy: "",
        approvedById: "",
        approvedAt: "",
        createdAt: new Date().toISOString(),
      });
      router.push("/payments");
    } catch {
      setError("Failed to submit donation. Please try again.");
    }
    setSaving(false);
  };

  if (!donationSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-2">Donate</h1>
        <p className="text-gray-500 text-sm mb-6">
          {donationSettings.donationTitle}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">Donation Amount</p>
            <p className="text-2xl font-bold text-blue-700">
              ৳{donationSettings.donationAmount}
            </p>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Pay via bKash, Nagad, Rocket or Bank and enter the transaction ID below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Method</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. BK1234567890"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the transaction ID from your payment confirmation.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Your donation will be verified by the Treasurer. Please keep your transaction receipt.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Submitting..." : "Submit Donation"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/payments")}
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