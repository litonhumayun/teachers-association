"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Notice {
  id: string;
  title: string;
  content: string;
  type: "public" | "secret";
  createdBy: string;
  createdAt: string;
}

const NOTICES_PER_PAGE = 6;

function NoticeCard({ notice, userRole, onDelete }: {
  notice: Notice;
  userRole: string;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = notice.content.length > 150;

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 hover:shadow-md transition ${
      notice.type === "secret" ? "border-red-500" : "border-green-500"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-base font-semibold text-gray-800 flex-1">
          {notice.title}
        </h2>
        <div className="flex items-center gap-2 ml-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            notice.type === "secret"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}>
            {notice.type === "secret" ? "🔒 Members Only" : "🌐 Public"}
          </span>
          {userRole === "admin" && (
            <button
              onClick={() => onDelete(notice.id)}
              className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">
        {expanded || !isLong ? notice.content : notice.content.slice(0, 150) + "..."}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-700 text-xs font-medium mt-1 hover:underline"
        >
          {expanded ? "Show Less" : "See More"}
        </button>
      )}
      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <p className="text-xs text-gray-400">Posted by: {notice.createdBy}</p>
        <p className="text-xs text-gray-400">
          {new Date(notice.createdAt).toLocaleDateString("en-BD")}
        </p>
      </div>
    </div>
  );
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "public" | "secret">("all");

  const fetchNotices = async (isLoggedIn: boolean) => {
    let q;
    if (isLoggedIn) {
      q = query(collection(db, "notices"));
    } else {
      q = query(collection(db, "notices"), where("type", "==", "public"));
    }
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notice));
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotices(data);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteDoc(doc(db, "notices", id));
      setNotices(notices.filter((n) => n.id !== id));
    } catch {
      alert("Failed to delete notice.");
    }
  };

  const filtered = notices.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const totalPages = Math.ceil(filtered.length / NOTICES_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * NOTICES_PER_PAGE,
    currentPage * NOTICES_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Notices</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} notices found</p>
        </div>
        <div className="flex items-center gap-3">
          {!loggedIn && (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-green-700 hover:underline">Login</Link> to see all notices
            </p>
          )}
          {["secretary", "president", "admin"].includes(userRole) && (
            <Link
              href="/notices/add"
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition"
            >
              + Add Notice
            </Link>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {loggedIn && (
        <div className="flex gap-2 mb-6">
          {["all", "public", "secret"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f as "all" | "public" | "secret"); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {f === "all" ? "All" : f === "public" ? "🌐 Public" : "🔒 Members Only"}
            </button>
          ))}
        </div>
      )}

      {/* Notices List */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-400">No notices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginated.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              userRole={userRole}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm ${
                currentPage === page
                  ? "bg-green-700 text-white"
                  : "border hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

    </main>
  );
}