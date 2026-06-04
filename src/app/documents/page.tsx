"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  description: string;
  link: string;
  createdBy: string;
  createdAt: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [filter, setFilter] = useState("all");
  const [userName, setUserName] = useState("");
const [userId, setUserId] = useState("");

  const categories = [
    "Constitution",
    "Meeting Minutes",
    "Financial Reports",
    "Notices",
    "Other",
  ];

  const fetchDocuments = async () => {
    try {
      const q = query(collection(db, "documents"));
      const snap = await getDocs(q);

      const data = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          } as DocumentItem)
      );

      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
  setUserRole(userDoc.data().role || "");
  setUserName(userDoc.data().name || "");
  setUserId(user.uid);
}
        }

        await fetchDocuments();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

 const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this document?")) return;
  try {
    await deleteDoc(doc(db, "documents", id));
    await logAction(
      "Document Deleted",
      `Document deleted by ${userName}`,
      userName,
      userId,
      "document"
    );
    setDocuments(documents.filter((d) => d.id !== id));
  } catch {
    alert("Failed to delete document.");
  }
};

  const filteredDocuments = documents.filter((document) => {
    if (filter === "all") return true;
    return document.category === filter;
  });

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-700">
              Documents
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredDocuments.length} documents found
            </p>
          </div>

          {["secretary", "president", "admin"].includes(userRole) && (
            <Link
              href="/documents/add"
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
            >
              + Add Document
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === category
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Documents */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-400">No documents found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      {document.category}
                    </span>

                    <h2 className="text-base font-semibold text-gray-800 mt-2">
                      {document.title}
                    </h2>
                  </div>

                  {userRole === "admin" && (
                    <button
                      onClick={() => handleDelete(document.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-gray-500 text-sm mb-4">
                  {document.description}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Added by: {document.createdBy}
                  </p>

                  <a
                    href={document.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-700 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-800 transition"
                  >
                    📄 View PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}