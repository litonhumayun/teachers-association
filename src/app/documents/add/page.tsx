"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { logAction } from "@/lib/auditLog";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore"; // Add this
import { documentUploadedTemplate } from "@/lib/emailTemplates"; // Add this


const ALLOWED_ROLES = ["secretary", "president", "admin"];

export default function AddDocument() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
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
          setUserName(data.name);
          if (!ALLOWED_ROLES.includes(data.role)) {
            router.push("/documents");
            
          }
          
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !category || !link) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      // 1. Save Document to Firestore
      await addDoc(collection(db, "documents"), {
        title,
        category,
        description,
        link,
        createdBy: userName,
        createdById: uid,
        createdAt: new Date().toISOString(),
      });

      // 2. Broadcast to all users
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach(async (userDoc) => {
        const userData = userDoc.data();
        if (userData.email) {
          await fetch("/api/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: userData.email,
              subject: "New Document Uploaded",
              html: documentUploadedTemplate(userData.name || "Member", title),
            }),
          });
        }
      });

      // 3. Log and Redirect
      await logAction("Document Added", `New document "${title}" added in ${category}`, userName, uid, "document");
      router.push("/documents");
    } catch {
      setError("Failed to add document. Please try again.");
    }
    setSaving(false);
  };

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Add Document</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Document title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Category</option>
              <option value="Constitution">Constitution</option>
              <option value="Meeting Minutes">Meeting Minutes</option>
              <option value="Financial Reports">Financial Reports</option>
              <option value="Notices">Notices</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Brief description of the document..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Google Drive Link <span className="text-red-500">*</span></label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload PDF to Google Drive → Share → Anyone with link → Copy link
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Document"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/documents")}
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