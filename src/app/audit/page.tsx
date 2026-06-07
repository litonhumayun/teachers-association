"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  performedAt: string;
  category: string;
}

const LOGS_PER_PAGE = 10;

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (!["admin", "president", "treasurer"].includes(role)) {
            router.push("/dashboard");
            return;
          }
        }
        const snap = await getDocs(query(collection(db, "auditLogs")));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
        data.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
        setLogs(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const filtered = logs.filter((l) => {
    if (filter === "all") return true;
    return l.category === filter;
  });

  const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "member": return "bg-blue-50 text-blue-700 border-blue-200";
      case "payment": return "bg-green-50 text-green-700 border-green-200";
      case "expense": return "bg-red-50 text-red-700 border-red-200";
      case "notice": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "document": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
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
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">

        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-green-700">Audit Log</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">{filtered.length} records found</p>
        </div>

        {/* Filter Tabs Grid System */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {["all", "member", "payment", "expense", "notice", "document"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition capitalize text-center border ${
                filter === f
                  ? "bg-green-700 text-white border-green-700 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Logs Container */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {paginated.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">No audit logs found.</p>
          ) : (
            <>
              {/* Desktop Table Layout (>= 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Date & Time</th>
                      <th className="px-4 py-3 text-left">Action</th>
                      <th className="px-4 py-3 text-left">Details</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.performedAt).toLocaleString("en-BD")}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{log.action}</td>
                        <td className="px-4 py-3 text-gray-600">{log.details}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium border capitalize ${getCategoryColor(log.category)}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout View (< 768px) */}
              <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
                {paginated.map((log) => (
                  <div key={log.id} className="p-4 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{log.action}</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(log.performedAt).toLocaleString("en-BD")}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border capitalize whitespace-nowrap ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 wrap-break-words">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-gray-500 pt-0.5">
                      <span className="text-gray-400">By:</span>
                      <span className="font-medium text-gray-700">{log.performedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Responsive Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
              >
                ← Prev
              </button>
              
              {/* Numeric Indicator for Mobile Viewports */}
              <span className="text-xs font-medium text-gray-500 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-xs md:text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-40 transition shadow-sm"
              >
                Next →
              </button>
            </div>

            {/* Pagination Number Trackers for Bigger Devices */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-green-700 text-white shadow-sm"
                      : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </ProtectedRoute>
  );
}