"use client";

import { generateReceipt } from "@/components/PaymentReceipt";
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
  approvedBy: string;
  approvedAt: string;
  donationTitle?: string;
}

// Moved OUTSIDE the main component
function PaymentTable({
  payments,
  showActions,
  onApprove,
  onReject,
}: {
  payments: Payment[];
  showActions: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {payments.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No payments found.</p>
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
              <th className="px-4 py-3 text-left">Status</th>
              {showActions && <th className="px-4 py-3 text-left">Actions</th>}
              <th className="px-4 py-3 text-left">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{payment.userName}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{payment.memberId}</td>
                <td className="px-4 py-3 capitalize">{payment.type}</td>
                <td className="px-4 py-3">
                  {payment.month
                    ? new Date(payment.month + "-01").toLocaleDateString("en-BD", {
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </td>
                <td className="px-4 py-3 font-medium text-green-600">৳{payment.amount}</td>
                <td className="px-4 py-3">{payment.method}</td>
                <td className="px-4 py-3 font-mono text-xs">{payment.transactionId}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    payment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {payment.status}
                  </span>
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(payment.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(payment.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <button
                    onClick={() => generateReceipt(payment)}
                    className="bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition"
                  >
                    📄 Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function VerifyPayments() {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [verifiedPayments, setVerifiedPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [userName, setUserName] = useState("");
  const [uid, setUid] = useState("");
  const router = useRouter();

  const fetchPayments = async () => {
    const pendingSnap = await getDocs(
      query(collection(db, "payments"), where("status", "==", "pending"))
    );
    const pendingData = pendingSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
    pendingData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setPendingPayments(pendingData);

    const allSnap = await getDocs(collection(db, "payments"));
    const verifiedData = allSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Payment))
      .filter((p) => p.status === "approved" || p.status === "rejected");
    verifiedData.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
    setVerifiedPayments(verifiedData);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.name);
          if (!["treasurer", "admin"].includes(data.role)) {
            router.push("/payments");
            return;
          }
        }
        await fetchPayments();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleApprove = async (id: string) => {
    const payment = pendingPayments.find((p) => p.id === id);
    await updateDoc(doc(db, "payments", id), {
      status: "approved",
      approvedBy: userName,
      approvedById: uid,
      approvedAt: new Date().toISOString(),
    });
    await logAction(
      "Payment Approved",
      `Payment of ৳${payment?.amount} approved for ${payment?.userName}`,
      userName,
      uid,
      "payment"
    );
    await fetchPayments();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this payment?")) return;
    const payment = pendingPayments.find((p) => p.id === id);
    await updateDoc(doc(db, "payments", id), {
      status: "rejected",
      rejectedBy: userName,
      rejectedById: uid,
      rejectedAt: new Date().toISOString(),
    });
    await logAction(
      "Payment Rejected",
      `Payment rejected for ${payment?.userName}`,
      userName,
      uid,
      "payment"
    );
    await fetchPayments();
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-700">Verify Payments</h1>
            <p className="text-sm text-gray-500 mt-1">
              {pendingPayments.length} pending — {verifiedPayments.length} verified
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "pending"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Pending ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "verified"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Verified ({verifiedPayments.length})
          </button>
        </div>

        {activeTab === "pending" && (
          <PaymentTable
            payments={pendingPayments}
            showActions={true}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        {activeTab === "verified" && (
          <PaymentTable
            payments={verifiedPayments}
            showActions={false}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}