import DonationBanner from "@/components/DonationBanner";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

async function getLatestNotices() {
  try {
    const q = query(
      collection(db, "notices"),
      where("type", "==", "public")
    );
    const snap = await getDocs(q);
    const notices = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
      id: string;
      title: string;
      content: string;
      createdBy: string;
      createdAt: string;
    }[];
    return notices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
  } catch {
    return [];
  }
}

export default async function Home() {
  const notices = await getLatestNotices();

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            BCS Non-Cadre TSC Teachers&apos; Association
          </h2>
          <p className="text-green-200 text-lg mb-8">
            Committed to the rights and development of teachers across Bangladesh
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition"
            >
              Join Us
            </Link>
            <Link
              href="/members"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition"
            >
              View Members
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-700 mb-2">500+</p>
            <p className="text-gray-500 text-sm">Members</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-700 mb-2">8</p>
            <p className="text-gray-500 text-sm">Divisions</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-700 mb-2">2018</p>
            <p className="text-gray-500 text-sm">Est. Year</p>
          </div>
        </div>

        {/* About */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">About Us</h2>
        <p className="text-gray-600 leading-relaxed">
          BCS Non-Cadre TSC Teachers&apos; Association is a platform for teachers
          working in Technical School and College (TSC) under the non-cadre BCS
          framework. We work together to protect the rights, welfare, and
          professional development of our members across Bangladesh.
        </p>
      </section>

      {/* Notices Section */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        {/* Donation Banner */}
  <DonationBanner />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">Latest Notices</h2>
          <Link
            href="/notices"
            className="text-green-700 text-sm font-medium hover:underline"
          >
            See All →
          </Link>
        </div>

        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-400">No notices yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
          {notices.map((notice) => (
  <div
    key={notice.id}
    className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-md transition"
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      {notice.title}
    </h3>
    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
      {notice.content}
    </p>
    <div className="mt-3 flex justify-between items-center">
      <p className="text-xs text-gray-400">Posted by: {notice.createdBy}</p>
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-400">
          {new Date(notice.createdAt).toLocaleDateString("en-BD")}
        </p>
        <Link href="/notices" className="text-green-700 text-xs font-medium hover:underline">
          See More →
        </Link>
      </div>
    </div>
  </div>
))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href="/notices"
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
          >
            See All Notices →
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 py-6 mb-8">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Contact Us</h2>
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-gray-700">info@bcstscteachers.org</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-gray-700">+880 1XXXXXXXXX</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-gray-700">Dhaka, Bangladesh</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Office Hours</p>
            <p className="text-gray-700">Saturday - Thursday, 9am - 5pm</p>
          </div>
        </div>
      </section>

    </main>
  );
}