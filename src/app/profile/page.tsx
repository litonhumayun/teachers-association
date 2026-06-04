"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  name: string;
  designation: string;
  subject: string;
  bcsBatch: string;
  division: string;
  institute: string;
  mobile: string;
  email: string;
  joiningDate: string;
  role: string;
  status: string;
  memberId: string;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uid, setUid] = useState("");
  const [showDeleteRequest, setShowDeleteRequest] = useState(false);
const [deleteReason, setDeleteReason] = useState("");
const [deleteSuccess, setDeleteSuccess] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData!, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    if (
  !userData?.name ||
  !userData?.designation ||
  !userData?.subject ||
  !userData?.bcsBatch ||
  !userData?.division ||
  !userData?.institute ||
  !userData?.mobile
) {
  setError("Please fill in all fields before saving.");
  setSaving(false);
  return;
}
    try {
      await updateDoc(doc(db, "users", uid), {
  name: userData?.name || "",
  designation: userData?.designation || "",
  subject: userData?.subject || "",
  bcsBatch: userData?.bcsBatch || "",
  division: userData?.division || "",
  institute: userData?.institute || "",
  mobile: userData?.mobile || "",
});
      setSuccess("Profile updated successfully!");
} catch {
  setError("Failed to update profile. Please try again.");
}
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
const handleDeleteRequest = async () => {
  if (!deleteReason) {
    setError("Please enter a reason.");
    return;
  }
  try {
    await addDoc(collection(db, "deleteRequests"), {
      userId: uid,
      userName: userData?.name,
      memberId: userData?.memberId,
      reason: deleteReason,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
    await logAction(
      "Delete Request",
      `${userData?.name} requested account deletion`,
      userData?.name || "",
      uid,
      "member"
    );
    setDeleteSuccess("Delete request submitted successfully!");
    setShowDeleteRequest(false);
    setDeleteReason("");
  } catch {
    setError("Failed to submit request. Please try again.");
  }
};
  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">My Profile</h1>

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={userData?.name || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <select
                name="designation"
                value={userData?.designation || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Designation</option>
                <option value="Attached Officer/Other">Attached Officer/Other</option>
                <option value="Junior Instructor">Junior Instructor</option>
                <option value="Instructor">Instructor</option>
                <option value="Chief Instructor">Chief Instructor</option>
                <option value="Principal">Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                name="subject"
                value={userData?.subject || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Subject</option>
                <option value="English">English</option>
                <option value="Bangla">Bangla</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
<div>
  <label className="block text-sm font-medium mb-1">BCS Batch</label>
  <select
    name="bcsBatch"
    value={userData?.bcsBatch || ""}
    onChange={handleChange}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select BCS Batch</option>
    <option value="00">No BCS (00)</option>
    <option value="38">38th BCS</option>
    <option value="39">39th BCS</option>
    <option value="40">40th BCS</option>
    <option value="41">41st BCS</option>
    <option value="42">42nd BCS</option>
    <option value="43">43rd BCS</option>
    <option value="44">44th BCS</option>
    <option value="45">45th BCS</option>
    <option value="46">46th BCS</option>
    <option value="47">47th BCS</option>
    <option value="48">48th BCS</option>
    <option value="49">49th BCS</option>
    <option value="50">50th BCS</option>
  </select>
</div>
            <div>
              <label className="block text-sm font-medium mb-1">Division</label>
              <select
                name="division"
                value={userData?.division || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Division</option>
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
              <label className="block text-sm font-medium mb-1">Current Institute</label>
              <input
                type="text"
                name="institute"
                value={userData?.institute || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={userData?.mobile || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={userData?.email || ""}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Joining Date</label>
              <input
                type="date"
                value={userData?.joiningDate || ""}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Joining date cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input
                type="text"
                value={userData?.role || ""}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
              />
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">Member ID</label>
  <input
    type="text"
    value={userData?.memberId || "Not assigned yet"}
    disabled
    className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
  />
  <p className="text-xs text-gray-400 mt-1">Member ID is assigned by admin</p>
</div>

          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
{/* Delete Request Section */}
<div className="mt-6 pt-6 border-t">
  {!showDeleteRequest ? (
    <button
      type="button"
      onClick={() => setShowDeleteRequest(true)}
      className="w-full border border-red-300 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm"
    >
      Request Account Deletion
    </button>
  ) : (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-red-600">Request Account Deletion</h3>
      <p className="text-xs text-gray-500">
        Your account will not be deleted immediately. Admin will review your request.
      </p>
      <textarea
        value={deleteReason}
        onChange={(e) => setDeleteReason(e.target.value)}
        rows={3}
        className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        placeholder="Reason for deletion..."
      />
      {deleteSuccess && <p className="text-green-500 text-sm">{deleteSuccess}</p>}
      <div className="flex gap-3">
        <button
          onClick={handleDeleteRequest}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm"
        >
          Submit Request
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteRequest(false)}
          className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )}
</div>
        </form>
      </main>
    </ProtectedRoute>
  );
}