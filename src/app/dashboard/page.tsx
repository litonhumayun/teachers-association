"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
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

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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

        {/* Welcome */}
        <div className="bg-green-700 text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold">Welcome, {userData?.name}!</h1>
          <p className="text-green-200 mt-1">{userData?.designation} — {userData?.institute}</p>
          <p className="text-green-200 text-sm mt-1">Role: {userData?.role} | Status: {userData?.status}</p>
        </div>

        {/* Info Cards */}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Division</p>
            <p className="text-lg font-semibold text-gray-700">{userData?.division}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
  <p className="text-sm text-gray-500">Member ID</p>
  <p className="text-lg font-semibold text-green-700">{userData?.memberId || "Not assigned yet"}</p>
</div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="text-lg font-semibold text-gray-700">{userData?.subject}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
  <p className="text-sm text-gray-500">BCS Batch</p>
  <p className="text-lg font-semibold text-gray-700">
    {userData?.bcsBatch === "00" ? "No BCS" : `${userData?.bcsBatch}th BCS`}
  </p>
</div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="text-lg font-semibold text-gray-700">{userData?.mobile}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Joining Date</p>
            <p className="text-lg font-semibold text-gray-700">{userData?.joiningDate}</p>
          </div>
        </div>

        {/* Pending Approval Warning */}
        {userData?.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg p-4">
            <p className="font-medium">⏳ Your account is pending approval.</p>
            <p className="text-sm mt-1">Please wait for an admin to approve your account.</p>
          </div>
        )}

      </main>
    </ProtectedRoute>
  );
}