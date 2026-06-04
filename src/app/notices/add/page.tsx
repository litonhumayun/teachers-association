"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALLOWED_ROLES = ["secretary", "president", "admin"];
const SECRET_ALLOWED_ROLES = ["secretary", "admin"];

export default function AddNotice() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"public" | "secret">("public");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [uid, setUid] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role);
          setUserName(data.name);
          if (!ALLOWED_ROLES.includes(data.role)) {
            router.push("/notices");
          }
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !content) {
      setError("Please fill in all fields.");
      return;
    }

    if (type === "secret" && !SECRET_ALLOWED_ROLES.includes(userRole)) {
      setError("You are not allowed to add secret notices.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "notices"), {
        title,
        content,
        type,
        createdBy: userName,
        createdById: uid,
        createdAt: new Date().toISOString(),
      });
      await logAction(
        "Notice Added",
        `New ${type} notice "${title}" added`,
        userName,
        uid,
        "notice"
      );
      router.push("/notices");
    } catch {
      setError("Failed to add notice. Please try again.");
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Add Notice</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Notice title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Notice content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notice Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "public" | "secret")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="public">🌐 Public — Everyone can see</option>
              {SECRET_ALLOWED_ROLES.includes(userRole) && (
                <option value="secret">🔒 Secret — Members only</option>
              )}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {saving ? "Posting..." : "Post Notice"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/notices")}
              className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </ProtectedRoute>
  );
}