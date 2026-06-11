import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import HomeClient from "../components/HomeClient";

async function getLatestNotices() {
  try {
    const q = query(collection(db, "notices"), where("type", "==", "public"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2);
  } catch {
    return [];
  }
}

export default async function Home() {
  const notices = await getLatestNotices();
  return <HomeClient notices={JSON.parse(JSON.stringify(notices))} />;
}