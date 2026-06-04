import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export const logAction = async (
  action: string,
  details: string,
  performedBy: string,
  performedById: string,
  category: string
) => {
  try {
    await addDoc(collection(db, "auditLogs"), {
      action,
      details,
      performedBy,
      performedById,
      category,
      performedAt: new Date().toISOString(),
    });
  } catch {
    console.error("Failed to log action");
  }
};