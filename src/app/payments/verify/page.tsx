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
        <p className="text-gray-400 text-center py-8 text-sm">No payments found.</p>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
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
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{payment.userName}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{payment.memberId}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{payment.type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {payment.month
                        ? new Date(payment.month + "-01").toLocaleDateString("en-BD", {
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">৳{payment.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{payment.method}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{payment.transactionId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                        payment.status === "approved"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : payment.status === "rejected"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    {showActions && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApprove(payment.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(payment.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => generateReceipt(payment)}
                        className="bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-800 transition"
                      >
                        📄 Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout View (< 768px) */}
          <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{payment.userName}</h3>
                    <p className="text-xs font-semibold text-green-700">{payment.memberId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-green-600">৳{payment.amount}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-full font-semibold capitalize border ${
                      payment.status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : payment.status === "rejected"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>

                {/* Meta details box */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Payment Type</span>
                    <span className="text-gray-700 font-medium capitalize">{payment.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Period</span>
                    <span className="text-gray-700 font-medium">
                      {payment.month
                        ? new Date(payment.month + "-01").toLocaleDateString("en-BD", {
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Method</span>
                    <span className="text-gray-700 font-medium">{payment.method}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block text-[10px] uppercase">Txn ID</span>
                    <span className="text-gray-700 font-mono text-[11px] break-all">{payment.transactionId}</span>
                  </div>
                </div>

                {/* Mobile Touch Action Rows */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {showActions && (
                    <>
                      <button
                        onClick={() => onApprove(payment.id)}
                        className="flex-1 min-w-25 bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-green-700 active:scale-[0.98] transition text-center shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(payment.id)}
                        className="flex-1 min-w-25 bg-red-500 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-red-600 active:scale-[0.98] transition text-center shadow-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => generateReceipt(payment)}
                    className={`${
                      showActions ? "w-full" : "w-full"
                    } bg-green-700 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-green-800 active:scale-[0.98] transition flex items-center justify-center gap-1 shadow-sm`}
                  >
                    📄 Download Receipt Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-green-700">Verify Payments</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              {pendingPayments.length} pending — {verifiedPayments.length} verified
            </p>
          </div>
        </div>

        {/* Responsive Grid Tabs System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition text-center border ${
              activeTab === "pending"
                ? "bg-green-700 text-white border-green-700 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Pending ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("verified")}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition text-center border ${
              activeTab === "verified"
                ? "bg-green-700 text-white border-green-700 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
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