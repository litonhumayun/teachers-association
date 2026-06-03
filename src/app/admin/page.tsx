"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
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
};

  const handleReject = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), {
      status: "rejected",
      rejectedBy: currentUser?.name,
      rejectedById: currentUser?.uid,
      rejectedAt: new Date().toISOString(),
    });
    await fetchMembers();
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
        <h1 className="text-2xl font-bold text-green-700 mb-6">Admin Panel</h1>

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
        </div>

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