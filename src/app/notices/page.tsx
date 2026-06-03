"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  type: "public" | "secret";
  createdBy: string;
  createdAt: string;
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");


  const fetchNotices = async (isLoggedIn: boolean) => {
    let q;
    if (isLoggedIn) {
      q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "notices"),
        where("type", "==", "public"),
        orderBy("createdAt", "desc")
      );
    }
    const snap = await getDocs(q);
    setNotices(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice))
    );
  };

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setLoggedIn(!!user);
    if (user) {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setUserRole(docSnap.data().role);
      }
    }
    await fetchNotices(!!user);
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
    <main className="max-w-4xl mx-auto px-4 py-8">


      {notices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-400">No notices yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                notice.type === "secret"
                  ? "border-red-500"
                  : "border-green-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {notice.title}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    notice.type === "secret"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {notice.type === "secret" ? "🔒 Members Only" : "🌐 Public"}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {notice.content}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Posted by: {notice.createdBy}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(notice.createdAt).toLocaleDateString("en-BD")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}