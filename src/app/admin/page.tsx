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
  // Get member data
  const memberDoc = await getDocs(
    query(collection(db, "users"), where("uid", "==", uid))
  );
  const memberData = memberDoc.docs[0].data();

  // Get subject code
  const subjectCode = subjectCodes[memberData.subject] || "00";

  // Get BCS batch
  const bcsBatch = memberData.bcsBatch || "00";

  // Count all active members for global serial
  const activeSnap = await getDocs(
    query(collection(db, "users"), where("status", "==", "active"))
  );
  const serial = String(activeSnap.size + 1).padStart(4, "0");

  // Generate member ID
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
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
  return (
    <ProtectedRoute>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Admin Panel</h1>

        {/* Tabs */}


{/* Tabs */}
<div className="flex gap-4 mb-6">
  <button
    onClick={() => setActiveTab("pending")}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      activeTab === "pending"
        ? "bg-green-700 text-white"
        : "bg-white text-gray-600 border hover:bg-gray-50"
    }`}
  >
    Pending Approval ({pendingMembers.length})
  </button>
  <button
    onClick={() => setActiveTab("all")}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      activeTab === "all"
        ? "bg-green-700 text-white"
        : "bg-white text-gray-600 border hover:bg-gray-50"
    }`}
  >
    All Members ({allMembers.length})
  </button>
  <button
    onClick={() => setActiveTab("donation")}
    className={`px-4 py-2 rounded-lg font-medium transition ${
      activeTab === "donation"
        ? "bg-green-700 text-white"
        : "bg-white text-gray-600 border hover:bg-gray-50"
    }`}
  >
    Donation Settings
  </button>
  <button
  onClick={() => setActiveTab("deleteRequests")}
  className={`px-4 py-2 rounded-lg font-medium transition ${
    activeTab === "deleteRequests"
      ? "bg-green-700 text-white"
      : "bg-white text-gray-600 border hover:bg-gray-50"
  }`}
>
  Delete Requests ({deleteRequests.length})
</button>
  <button
  onClick={() => setActiveTab("audit")}
  className={`px-4 py-2 rounded-lg font-medium transition ${
    activeTab === "audit"
      ? "bg-green-700 text-white"
      : "bg-white text-gray-600 border hover:bg-gray-50"
  }`}
>
  Audit Log
</button>
</div>
{activeTab === "audit" && (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-700">Audit Log</h2>

      <a
        href="/audit"
        className="text-green-700 text-sm font-medium hover:underline"
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
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold text-gray-700 mb-4">Donation Settings</h2>

    {/* Current Status */}
    <div className={`rounded-lg p-4 mb-6 ${
      donationSettings.donationActive
        ? "bg-green-50 border border-green-200"
        : "bg-gray-50 border border-gray-200"
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-gray-700">Current Status</p>
          {donationSettings.donationActive ? (
            <div className="mt-1">
              <p className="text-sm text-green-700 font-medium">
                🟢 Active — {donationSettings.donationTitle}
              </p>
              <p className="text-sm text-green-600">
                Amount: ৳{donationSettings.donationAmount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Activated by: {donationSettings.donationActivatedBy}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">🔴 Inactive</p>
          )}
        </div>
        {donationSettings.donationActive && (
          <button
            onClick={handleDeactivateDonation}
            disabled={donationSaving}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-50"
          >
            Deactivate
          </button>
        )}
      </div>
    </div>

    {/* Activate New Donation */}
    {!donationSettings.donationActive && (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Activate New Donation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Donation Title</label>
            <input
              type="text"
              value={donationTitle}
              onChange={(e) => setDonationTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Annual Picnic Fund"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (৳)</label>
            <input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 1000"
            />
          </div>
        </div>
        <button
          onClick={handleActivateDonation}
          disabled={donationSaving}
          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
        >
          {donationSaving ? "Activating..." : "Activate Donation"}
        </button>
      </div>
    )}
  </div>
)}
{/* Delete Requests */}
{activeTab === "deleteRequests" && (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    {deleteRequests.length === 0 ? (
      <p className="text-gray-400 text-center py-8">No delete requests.</p>
    ) : (
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
        <tbody>
          {deleteRequests.map((req) => (
            <tr key={req.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3">{req.userName}</td>
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
                      await logAction(
                        "Member Deleted",
                        `${req.userName} (${req.memberId}) deleted by admin`,
                        currentUser?.name || "",
                        currentUser?.uid || "",
                        "member"
                      );
                      await fetchDeleteRequests();
                      await fetchMembers();
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={async () => {
                      await updateDoc(doc(db, "deleteRequests", req.id), { status: "rejected" });
                      await fetchDeleteRequests();
                    }}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500 transition"
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
)}

        {/* Pending Members */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pendingMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending members.</p>
            ) : (
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
               <tbody>
  {pendingMembers.map((member) => (
    <tr key={member.uid} className="border-t hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-green-700">{member.memberId || "Pending"}</td>
      <td className="px-4 py-3">{member.name}</td>
      <td className="px-4 py-3">{member.designation}</td>
      <td className="px-4 py-3">{member.division}</td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          {member.status}
        </span>
      </td>
      <td className="px-4 py-3">{member.role}</td>
      <td className="px-4 py-3 flex gap-2">
        <button
          onClick={() => handleApprove(member.uid)}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        >
          Approve
        </button>
        <button
          onClick={() => handleReject(member.uid)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Reject
        </button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            )}
          </div>
        )}

        {/* All Members */}
        {activeTab === "all" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {allMembers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No members found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Designation</th>
                    <th className="px-4 py-3 text-left">Division</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
  {allMembers.map((member) => (
    <tr key={member.uid} className="border-t hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-green-700">
        {member.memberId || "N/A"}
      </td>
      <td className="px-4 py-3">{member.name}</td>
      <td className="px-4 py-3">{member.designation}</td>
      <td className="px-4 py-3">{member.division}</td>
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
          className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
    >
      Delete
    </button>
  ) : (
    <span className="text-gray-400 text-xs">Deleted</span>
  )}
</td>
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