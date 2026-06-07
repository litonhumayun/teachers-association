"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserData {
  uid: string;
  name: string;
  designation: string;
  institute: string;
  division: string;
  subject: string;
  bcsBatch: string;
  mobile: string;
  email: string;
  joiningDate: string;
  role: string;
  status: string;
  memberId: string;
}

export default function AdminPanel() {
  const [pendingMembers, setPendingMembers] = useState<UserData[]>([]);
  const [allMembers, setAllMembers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [deleteRequests, setDeleteRequests] = useState<{
    id: string;
    userId: string;
    userName: string;
    memberId: string;
    reason: string;
    status: string;
    requestedAt: string;
  }[]>([]);

  const [donationSettings, setDonationSettings] = useState({
    donationActive: false,
    donationAmount: 0,
    donationTitle: "",
    donationActivatedBy: "",
    donationActivatedAt: "",
  });

  const [donationAmount, setDonationAmount] = useState("");
  const [donationTitle, setDonationTitle] = useState("");
  const [donationSaving, setDonationSaving] = useState(false);

  const router = useRouter();
  const subjectCodes: { [key: string]: string } = {
    English: "11",
    Bangla: "22",
    Mathematics: "33",
    Physics: "44",
    Chemistry: "55",
  };

  const fetchMembers = async () => {
    const pendingQuery = query(
      collection(db, "users"),
      where("status", "==", "pending")
    );
    const pendingSnap = await getDocs(pendingQuery);
    setPendingMembers(pendingSnap.docs.map((d) => d.data() as UserData));

    const allSnap = await getDocs(collection(db, "users"));
    setAllMembers(allSnap.docs.map((d) => d.data() as UserData));
  };

  const fetchDonationSettings = async () => {
    const docSnap = await getDoc(doc(db, "settings", "donation"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setDonationSettings({
        donationActive: data.donationActive || false,
        donationAmount: data.donationAmount || 0,
        donationTitle: data.donationTitle || "",
        donationActivatedBy: data.donationActivatedBy || "",
        donationActivatedAt: data.donationActivatedAt || "",
      });
    }
  };

  const fetchDeleteRequests = async () => {
    const snap = await getDocs(
      query(collection(db, "deleteRequests"), where("status", "==", "pending"))
    );
    setDeleteRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as {
      id: string;
      userId: string;
      userName: string;
      memberId: string;
      reason: string;
      status: string;
      requestedAt: string;
    })));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data() as UserData;
          setCurrentUser(userData);
          if (userData.role !== "admin") {
            router.push("/dashboard");
            return;
          }
        }
        await fetchMembers();
        await fetchDonationSettings();
        await fetchDeleteRequests();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleApprove = async (uid: string) => {
    const memberDoc = await getDocs(
      query(collection(db, "users"), where("uid", "==", uid))
    );
    const memberData = memberDoc.docs[0].data();
    const subjectCode = subjectCodes[memberData.subject] || "00";
    const bcsBatch = memberData.bcsBatch || "00";

    const activeSnap = await getDocs(
      query(collection(db, "users"), where("status", "==", "active"))
    );
    const serial = String(activeSnap.size + 1).padStart(4, "0");
    const memberId = `BNTTA-${bcsBatch}-${subjectCode}-${serial}`;

    await updateDoc(doc(db, "users", uid), {
      status: "active",
      memberId: memberId,
      approvedBy: currentUser?.name,
      approvedById: currentUser?.uid,
      approvedAt: new Date().toISOString(),
    });
    await fetchMembers();
    await logAction(
      "Member Approved",
      `Member ${memberData.name} (${memberId}) approved`,
      currentUser?.name || "",
      currentUser?.uid || "",
      "member"
    );
  };

  const handleReject = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), {
      status: "rejected",
      rejectedBy: currentUser?.name,
      rejectedById: currentUser?.uid,
      rejectedAt: new Date().toISOString(),
    });
    await fetchMembers();
    await logAction(
      "Member Rejected",
      `Member rejected by ${currentUser?.name}`,
      currentUser?.name || "",
      currentUser?.uid || "",
      "member"
    );
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    await updateDoc(doc(db, "users", uid), {
      status: "deleted",
    });
    await fetchMembers();
  };

  const handleRoleChange = async (uid: string, role: string) => {
    await updateDoc(doc(db, "users", uid), { role });
    await fetchMembers();
    await logAction(
      "Role Changed",
      `Member role changed to ${role}`,
      currentUser?.name || "",
      currentUser?.uid || "",
      "member"
    );
  };

  const handleActivateDonation = async () => {
    if (!donationAmount || !donationTitle) {
      alert("Please enter donation amount and title.");
      return;
    }
    setDonationSaving(true);
    await setDoc(doc(db, "settings", "donation"), {
      donationActive: true,
      donationAmount: Number(donationAmount),
      donationTitle,
      donationActivatedBy: currentUser?.name,
      donationActivatedAt: new Date().toISOString(),
    });
    await fetchDonationSettings();
    setDonationSaving(false);
  };

  const handleDeactivateDonation = async () => {
    if (!confirm("Are you sure you want to deactivate donation?")) return;
    setDonationSaving(true);
    await setDoc(doc(db, "settings", "donation"), {
      donationActive: false,
      donationAmount: 0,
      donationTitle: "",
      donationActivatedBy: "",
      donationActivatedAt: "",
    });
    await fetchDonationSettings();
    setDonationSaving(false);
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
        <h1 className="text-xl md:text-2xl font-bold text-green-700 mb-6">Admin Panel</h1>

        {/* Responsive Horizontal Scrollable Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5  gap-2 mb-6">
          {[
            { id: "pending", label: `Pending Approval (${pendingMembers.length})` },
            { id: "all", label: `All Members (${allMembers.length})` },
            { id: "donation", label: "Donation Settings" },
            { id: "deleteRequests", label: `Delete Requests (${deleteRequests.length})` },
            { id: "audit", label: "Audit Log" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition text center border ${
                activeTab === tab.id
                  ? "bg-green-700 text-white border-green-700 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Audit Log View */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Audit Log</h2>
              <a
                href="/audit"
                className="text-green-700 text-sm font-medium hover:underline inline-flex items-center"
              >
                View Full Audit Log →
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              Click the link above to view the full audit log with filters and pagination.
            </p>
          </div>
        )}

        {/* Donation Settings */}
        {activeTab === "donation" && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Donation Settings</h2>

            {/* Current Status Box */}
            <div className={`rounded-lg p-4 mb-6 ${
              donationSettings.donationActive
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50 border border-gray-200"
            }`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-medium text-gray-700 text-sm">Current Status</p>
                  {donationSettings.donationActive ? (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-sm text-green-700 font-semibold">
                        🟢 Active — {donationSettings.donationTitle}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Amount: ৳{donationSettings.donationAmount}
                      </p>
                      <p className="text-xs text-gray-400">
                        Activated by: {donationSettings.donationActivatedBy}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1 font-medium">🔴 Inactive</p>
                  )}
                </div>
                {donationSettings.donationActive && (
                  <button
                    onClick={handleDeactivateDonation}
                    disabled={donationSaving}
                    className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>

            {/* Activate New Donation Form */}
            {!donationSettings.donationActive && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Activate New Donation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Donation Title</label>
                    <input
                      type="text"
                      value={donationTitle}
                      onChange={(e) => setDonationTitle(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Annual Picnic Fund"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount (৳)</label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. 1000"
                    />
                  </div>
                </div>
                <button
                  onClick={handleActivateDonation}
                  disabled={donationSaving}
                  className="w-full sm:w-auto bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition disabled:opacity-50"
                >
                  {donationSaving ? "Activating..." : "Activate Donation"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delete Requests Container */}
        {activeTab === "deleteRequests" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {deleteRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No delete requests found.</p>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left">Member</th>
                        <th className="px-4 py-3 text-left">Member ID</th>
                        <th className="px-4 py-3 text-left">Reason</th>
                        <th className="px-4 py-3 text-left">Requested At</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {deleteRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{req.userName}</td>
                          <td className="px-4 py-3 text-green-700 font-medium">{req.memberId}</td>
                          <td className="px-4 py-3 text-gray-500">{req.reason}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(req.requestedAt).toLocaleDateString("en-BD")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this member?")) return;
                                  await updateDoc(doc(db, "users", req.userId), { status: "deleted" });
                                  await updateDoc(doc(db, "deleteRequests", req.id), { status: "approved" });
                                  await logAction("Member Deleted", `${req.userName} (${req.memberId}) deleted by admin`, currentUser?.name || "", currentUser?.uid || "", "member");
                                  await fetchDeleteRequests();
                                  await fetchMembers();
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                              <button
                                onClick={async () => {
                                  await updateDoc(doc(db, "deleteRequests", req.id), { status: "rejected" });
                                  await fetchDeleteRequests();
                                }}
                                className="bg-gray-400 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-500 transition"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                  {deleteRequests.map((req) => (
                    <div key={req.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{req.userName}</p>
                          <p className="text-xs text-green-700 font-medium">{req.memberId}</p>
                        </div>
                        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">
                          {new Date(req.requestedAt).toLocaleDateString("en-BD")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-dashed">
                        <span className="font-medium text-gray-700">Reason:</span> {req.reason}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this member?")) return;
                            await updateDoc(doc(db, "users", req.userId), { status: "deleted" });
                            await updateDoc(doc(db, "deleteRequests", req.id), { status: "approved" });
                            await logAction("Member Deleted", `${req.userName} (${req.memberId}) deleted by admin`, currentUser?.name || "", currentUser?.uid || "", "member");
                            await fetchDeleteRequests();
                            await fetchMembers();
                          }}
                          className="flex-1 bg-red-500 text-white text-center py-1.5 rounded text-xs font-medium hover:bg-red-600 transition"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={async () => {
                            await updateDoc(doc(db, "deleteRequests", req.id), { status: "rejected" });
                            await fetchDeleteRequests();
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 text-center py-1.5 rounded text-xs font-medium hover:bg-gray-400 transition"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pending Approval Section */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pendingMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No pending members.</p>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left">Member ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Designation</th>
                        <th className="px-4 py-3 text-left">Division</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingMembers.map((member) => (
                        <tr key={member.uid} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-green-700">{member.memberId || "Pending"}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                          <td className="px-4 py-3 text-gray-600">{member.designation}</td>
                          <td className="px-4 py-3 text-gray-600">{member.division}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{member.role}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(member.uid)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(member.uid)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                  {pendingMembers.map((member) => (
                    <div key={member.uid} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 text-base">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.designation} • {member.division}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                          {member.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded">
                        <p><span className="font-medium text-gray-700">Assigned ID:</span> {member.memberId || "Pending Code Allocation"}</p>
                        <p><span className="font-medium text-gray-700">Default Role:</span> <span className="capitalize">{member.role}</span></p>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(member.uid)}
                          className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-semibold hover:bg-green-700 transition shadow-sm"
                        >
                          Approve Registration
                        </button>
                        <button
                          onClick={() => handleReject(member.uid)}
                          className="flex-1 bg-red-500 text-white py-2 rounded text-xs font-semibold hover:bg-red-600 transition shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* All Members Section */}
        {activeTab === "all" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {allMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8 text-sm">No members found.</p>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left">Member ID</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Designation</th>
                        <th className="px-4 py-3 text-left">Division</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Role Hierarchy</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allMembers.map((member) => (
                        <tr key={member.uid} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-green-700">{member.memberId || "N/A"}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                          <td className="px-4 py-3 text-gray-600">{member.designation}</td>
                          <td className="px-4 py-3 text-gray-600">{member.division}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === "active"
                                ? "bg-green-100 text-green-700"
                                : member.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : member.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                              className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="member">Member</option>
                              <option value="treasurer">Treasurer</option>
                              <option value="secretary">Secretary</option>
                              <option value="divisional_president">Divisional President</option>
                              <option value="president">President</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {member.status !== "deleted" ? (
                              <button
                                onClick={() => handleDelete(member.uid)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs font-medium">Deleted</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Cards */}
                <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                  {allMembers.map((member) => (
                    <div key={member.uid} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 text-base">{member.name}</p>
                          <p className="text-xs text-green-700 font-semibold">{member.memberId || "No ID Allocated"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          member.status === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : member.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                            : member.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-gray-50 text-gray-700 border-gray-100"
                        }`}>
                          {member.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <p><span className="font-medium text-gray-700">Designation:</span><br/>{member.designation}</p>
                        <p><span className="font-medium text-gray-700">Division:</span><br/>{member.division}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                        <div className="flex flex-col w-full">
                          <label className="text-[11px] font-medium text-gray-400 mb-0.5">Administrative Role</label>
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.uid, e.target.value)}
                            className="w-full border rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="member">Member</option>
                            <option value="treasurer">Treasurer</option>
                            <option value="secretary">Secretary</option>
                            <option value="divisional_president">Divisional President</option>
                            <option value="president">President</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>

                        <div className="flex items-end justify-end pt-2 sm:pt-0">
                          {member.status !== "deleted" ? (
                            <button
                              onClick={() => handleDelete(member.uid)}
                              className="w-full sm:w-auto bg-red-500 text-white text-center px-4 py-1.5 rounded text-xs font-semibold hover:bg-red-600 transition"
                            >
                              Delete Account
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs py-1.5 font-medium">Account Removed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}