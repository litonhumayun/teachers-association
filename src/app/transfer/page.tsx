"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Transfer {
  id: string;
  userId: string;
  userName: string;
  memberId: string;
  fromInstitute: string;
  toInstitute: string;
  fromDivision: string;
  toDivision: string;
  reason: string;
  status: string;
  requestedAt: string;
  approvedBy: string;
  approvedAt: string;
}

interface UserData {
  uid: string;
  name: string;
  memberId: string;
  institute: string;
  division: string;
  role: string;
}

export default function Transfer() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [toInstitute, setToInstitute] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("request");
  const [toDivision, setToDivision] = useState("");

  const fetchTransfers = async (uid: string, role: string) => {
    let q;
    if (role === "admin") {
      q = query(collection(db, "transfers"));
    } else {
      q = query(collection(db, "transfers"), where("userId", "==", uid));
    }
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transfer));
    data.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    setTransfers(data);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = { uid: user.uid, ...docSnap.data() } as UserData;
          setUserData(data);
          await fetchTransfers(user.uid, data.role);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!toInstitute || !reason) {
      setError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "transfers"), {
        userId: userData?.uid,
        userName: userData?.name,
        memberId: userData?.memberId,
        fromInstitute: userData?.institute,
toInstitute,
toDivision: toDivision || userData?.division,
fromDivision: userData?.division,
        reason,
        status: "pending",
        requestedAt: new Date().toISOString(),
        approvedBy: "",
        approvedAt: "",
      });

      await logAction(
        "Transfer Requested",
        `${userData?.name} requested transfer from ${userData?.institute} to ${toInstitute}`,
        userData?.name || "",
        userData?.uid || "",
        "member"
      );

      setSuccess("Transfer request submitted successfully!");
      setToInstitute("");
      setReason("");
      await fetchTransfers(userData?.uid || "", userData?.role || "");
    } catch {
      setError("Failed to submit request. Please try again.");
    }
    setSaving(false);
  };

  const handleApprove = async (transfer: Transfer) => {
    if (!confirm("Approve this transfer?")) return;
    try {
      await updateDoc(doc(db, "transfers", transfer.id), {
        status: "approved",
        approvedBy: userData?.name,
        approvedAt: new Date().toISOString(),
      });

      // Update member's institute

      await updateDoc(doc(db, "users", transfer.userId), {
  institute: transfer.toInstitute,
  division: transfer.toDivision || transfer.fromDivision,
});

      await logAction(
        "Transfer Approved",
        `${transfer.userName} transferred from ${transfer.fromInstitute} to ${transfer.toInstitute}`,
        userData?.name || "",
        userData?.uid || "",
        "member"
      );

      await fetchTransfers(userData?.uid || "", userData?.role || "");
    } catch {
      alert("Failed to approve transfer.");
    }
  };

  const handleReject = async (transfer: Transfer) => {
    if (!confirm("Reject this transfer?")) return;
    try {
      await updateDoc(doc(db, "transfers", transfer.id), {
        status: "rejected",
        approvedBy: userData?.name,
        approvedAt: new Date().toISOString(),
      });

      await logAction(
        "Transfer Rejected",
        `Transfer request of ${transfer.userName} rejected`,
        userData?.name || "",
        userData?.uid || "",
        "member"
      );

      await fetchTransfers(userData?.uid || "", userData?.role || "");
    } catch {
      alert("Failed to reject transfer.");
    }
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Institute Transfer</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("request")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "request"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Request Transfer
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "history"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {userData?.role === "admin" ? "All Requests" : "My Requests"} ({transfers.length})
          </button>
        </div>

        {/* Request Transfer Form */}
        {activeTab === "request" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Current Institute</p>
              <p className="font-semibold text-gray-700">{userData?.institute}</p>
            </div>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Institute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={toInstitute}
                  onChange={(e) => setToInstitute(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter new institute name"
                />
              </div>
<div>
  <label className="block text-sm font-medium mb-1">
    New Division <span className="text-gray-400 text-xs">(leave unchanged if same)</span>
  </label>
  <select
    value={toDivision}
    onChange={(e) => setToDivision(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Same as current ({userData?.division})</option>
    <option value="Dhaka">Dhaka</option>
    <option value="Chittagong">Chittagong</option>
    <option value="Rajshahi">Rajshahi</option>
    <option value="Khulna">Khulna</option>
    <option value="Barisal">Barisal</option>
    <option value="Sylhet">Sylhet</option>
    <option value="Rangpur">Rangpur</option>
    <option value="Mymensingh">Mymensingh</option>
  </select>
</div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Why are you transferring?"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Your transfer request will be reviewed by Admin.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit Transfer Request"}
              </button>
            </form>
          </div>
        )}

        {/* Transfer History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {transfers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No transfer requests found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {userData?.role === "admin" && (
                      <th className="px-4 py-3 text-left">Member</th>
                    )}
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Division</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    {userData?.role === "admin" && (
                      <th className="px-4 py-3 text-left">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-t hover:bg-gray-50">
                      {userData?.role === "admin" && (
                        <td className="px-4 py-3">
                          <p className="font-medium">{transfer.userName}</p>
                          <p className="text-xs text-gray-400">{transfer.memberId}</p>
                        </td>
                      )}
                      <td className="px-4 py-3">{transfer.fromInstitute}</td>
                      <td className="px-4 py-3">{transfer.toInstitute}</td>
                      <td className="px-4 py-3">
  {transfer.toDivision && transfer.toDivision !== transfer.fromDivision
    ? <span>{transfer.fromDivision} → {transfer.toDivision}</span>
    : <span className="text-gray-400">No change</span>
  }
</td>
                      <td className="px-4 py-3 text-gray-500">{transfer.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          transfer.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : transfer.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {transfer.status}
                        </span>
                      </td>
                      {userData?.role === "admin" && transfer.status === "pending" && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(transfer)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(transfer)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                      {userData?.role === "admin" && transfer.status !== "pending" && (
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {transfer.approvedBy && `By ${transfer.approvedBy}`}
                        </td>
                      )}
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