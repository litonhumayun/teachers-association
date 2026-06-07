"use client";

import InstituteSelect from "@/components/InstituteSelect";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

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

  const handleSave = async (e: React.FormEvent) => {
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

  const handleDeleteRequest = async () => {
    if (!deleteReason) {
      setError("Please enter a reason.");
      return;
    }
    try {
      await addDoc(collection(db, "deleteRequests"), {
        userId: uid,
        userName: userData?.name || "",
        memberId: userData?.memberId || "",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl text-center md:text-2xl font-bold text-green-700 mb-4 md:mb-6">My Profile</h1>

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 md:p-6">
          
          {/* Main Form Fields — Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={userData?.name || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Designation</label>
              <select
                name="designation"
                value={userData?.designation || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Subject</label>
              <select
                name="subject"
                value={userData?.subject || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">BCS Batch</label>
              <select
                name="bcsBatch"
                value={userData?.bcsBatch || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Division</label>
              <select
                name="division"
                value={userData?.division || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Current Institute</label>
              <InstituteSelect
                value={userData?.institute || ""}
                onChange={(value) => setUserData({ ...userData!, institute: value })}
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-700">Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={userData?.mobile || ""}
                onChange={handleChange}
                className="w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-400">Email</label>
              <input
                type="email"
                value={userData?.email || ""}
                disabled
                className="w-full border text-sm rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-400">Joining Date</label>
              <input
                type="date"
                value={userData?.joiningDate || ""}
                disabled
                className="w-full border text-sm rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Joining date cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-400">Role</label>
              <input
                type="text"
                value={userData?.role || ""}
                disabled
                className="w-full border text-sm rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-400">Member ID</label>
              <input
                type="text"
                value={userData?.memberId || "Not assigned yet"}
                disabled
                className="w-full border text-sm rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 mt-1">Member ID is assigned by admin</p>
            </div>

          </div>

          {error && <p className="text-red-500 text-xs md:text-sm mt-4 font-medium">{error}</p>}
          {success && <p className="text-green-600 text-xs md:text-sm mt-4 font-medium">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full bg-green-700 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-green-800 transition disabled:opacity-50 active:scale-[0.99]"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {/* Delete Request Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {!showDeleteRequest ? (
              <button
                type="button"
                onClick={() => setShowDeleteRequest(true)}
                className="w-full border border-red-200 text-red-500 py-2.5 rounded-lg hover:bg-red-50/50 transition text-xs font-medium"
              >
                Request Account Deletion
              </button>
            ) : (
              <div className="space-y-3 bg-red-50/30 p-3.5 rounded-lg border border-red-100">
                <h3 className="text-xs md:text-sm font-semibold text-red-600">Request Account Deletion</h3>
                <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed">
                  Your account will not be deleted immediately. Admin will review your request.
                </p>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm bg-white"
                  placeholder="Reason for deletion..."
                />
                {deleteSuccess && <p className="text-green-600 text-xs font-medium">{deleteSuccess}</p>}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDeleteRequest}
                    className="w-full sm:flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-xs font-medium order-1 sm:order-2"
                  >
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteRequest(false)}
                    className="w-full sm:flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-xs font-medium order-2 sm:order-1"
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