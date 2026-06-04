"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  memberId: string;
  type: string;
  amount: number;
  month: string;
  method: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

export default function VerifyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [uid, setUid] = useState("");
  const router = useRouter();

  const fetchPendingPayments = async () => {
    const q = query(
      collection(db, "payments"),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
    data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setPayments(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.name);
          setUserRole(data.role);
          if (!["treasurer", "admin"].includes(data.role)) {
            router.push("/payments");
            return;
          }
        }
        await fetchPendingPayments();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "payments", id), {
      status: "approved",
      approvedBy: userName,
      approvedById: uid,
      approvedAt: new Date().toISOString(),
    });
    await fetchPendingPayments();
    await logAction(
  "Payment Approved",
  `Payment of ৳${payments.find(p => p.id === id)?.amount} approved for ${payments.find(p => p.id === id)?.userName}`,
  userName,
  uid,
  "payment"
);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;
    await updateDoc(doc(db, "payments", id), {
      status: "rejected",
      rejectedBy: userName,
      rejectedById: uid,
      rejectedAt: new Date().toISOString(),
    });
    await fetchPendingPayments();
    await logAction(
  "Payment Rejected",
  `Payment rejected for ${payments.find(p => p.id === id)?.userName}`,
  userName,
  uid,
  "payment"
);
  };

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
            <h1 className="text-2xl font-bold text-green-700">Verify Payments</h1>
            <p className="text-sm text-gray-500 mt-1">
              {payments.length} pending payments
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {payments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No pending payments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Member ID</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Transaction ID</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{payment.userName}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {payment.memberId}
                    </td>
                    <td className="px-4 py-3 capitalize">{payment.type}</td>
                    <td className="px-4 py-3">
                      {payment.month
                        ? new Date(payment.month + "-01").toLocaleDateString("en-BD", {
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      ৳{payment.amount}
                    </td>
                    <td className="px-4 py-3">{payment.method}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {payment.transactionId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(payment.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
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