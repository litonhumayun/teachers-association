"use client";
import { motion } from "framer-motion";
import { ArrowRight, Bell } from "lucide-react";
import DonationBanner from "@/components/DonationBanner";
import Link from "next/link";
import LeadershipMessage from "./LeadershipMessage";

export default function HomeClient({ notices }: { notices: any[] }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl font-extrabold mb-4 tracking-tight text-white">
            BCS Non-Cadre TSC Teachers' Association
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-green-100 text-lg mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            The unified voice for technical educators. Dedicated to safeguarding professional rights, ensuring welfare, and driving technical excellence within the TSCs.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="flex gap-4 justify-center">
            <Link href="/register" className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition">Join Us</Link>
            <Link href="/members" className="border border-green-500 bg-green-900/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-900 transition">View Members</Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-4xl mx-auto px-4 -mt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-3 gap-4">
          {[ { n: "500+", l: "Members", bg: "bg-emerald-50", text: "text-emerald-700" }, { n: "8", l: "Divisions", bg: "bg-blue-50", text: "text-blue-700" }, { n: "2018", l: "Est. Year", bg: "bg-amber-50", text: "text-amber-700" } ].map((stat, i) => (
            <motion.div key={stat.l} whileHover={{ y: -5 }} className={`${stat.bg} p-6 rounded-xl shadow-md border border-gray-100 text-center transition-colors`}>
              <p className={`text-3xl font-black ${stat.text} mb-1`}>{stat.n}</p>
              <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">{stat.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Notices Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 bg-slate-50">
        <div className="mb-16"><DonationBanner /></div>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Latest Notices</h2>
          <div className="w-20 h-1.5 bg-green-600 mx-auto rounded-full"></div>
        </div>
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><p className="text-gray-400 italic">No public notices available.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {notices.map((notice, i) => (
              <motion.div key={notice.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-100 rounded-2xl text-green-700"><Bell className="w-6 h-6" /></div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">{new Date(notice.createdAt).toLocaleDateString("en-BD")}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{notice.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">{notice.content}</p>
                <Link href="/notices" className="inline-flex items-center gap-2 text-green-700 font-bold hover:gap-4 transition-all">Read More <ArrowRight className="w-4 h-4" /></Link>
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-center mt-16"><Link href="/notices" className="inline-block bg-green-700 text-white px-10 py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-lg">Explore All Notices</Link></div>
      </section>
{/* President & Secretary Message Section */}
<LeadershipMessage />


      {/* Contact Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[ { label: "Email Address", value: "bntta.2021@gmail.com" }, { label: "Phone Number", value: "01971908465" }, { label: "Office Location", value: "Agargaon, Dhaka" }, { label: "Official Website", value: "humayunliton.com" } ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4 hover:border-green-200 transition-colors">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-gray-800 font-semibold text-lg">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}