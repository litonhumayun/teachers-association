"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  uid: string;
  name: string;
  designation: string;
  subject: string;
  bcsBatch: string;
  division: string;
  institute: string;
  mobile: string;
  email: string;
  joiningDate: string;
  role: string;
  status: string;
  memberId: string;
}

export default function Members() {
  const [members, setMembers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterBcsBatch, setFilterBcsBatch] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      const q = query(
        collection(db, "users"),
        where("status", "==", "active")
      );
      const snap = await getDocs(q);
      setMembers(snap.docs.map((d) => d.data() as UserData));
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
      m.institute?.toLowerCase().includes(search.toLowerCase());
    const matchDivision = filterDivision ? m.division === filterDivision : true;
    const matchSubject = filterSubject ? m.subject === filterSubject : true;
    const matchDesignation = filterDesignation ? m.designation === filterDesignation : true;
    const matchBcsBatch = filterBcsBatch ? m.bcsBatch === filterBcsBatch : true;
    return matchSearch && matchDivision && matchSubject && matchDesignation && matchBcsBatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold text-green-700 mb-4 md:mb-6">Members Directory</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search name, ID, institute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:flex-1 lg:min-w-48"
          />
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:w-auto"
          >
            <option value="">All Divisions</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Rajshahi">Rajshahi</option>
            <option value="Khulna">Khulna</option>
            <option value="Barisal">Barisal</option>
            <option value="Sylhet">Sylhet</option>
            <option value="Rangpur">Rangpur</option>
            <option value="Mymensingh">Mymensingh</option>
          </select>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:w-auto"
          >
            <option value="">All Subjects</option>
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:w-auto"
          >
            <option value="">All Designations</option>
            <option value="Attached Officer/Other">Attached Officer/Other</option>
            <option value="Junior Instructor">Junior Instructor</option>
            <option value="Instructor">Instructor</option>
            <option value="Chief Instructor">Chief Instructor</option>
            <option value="Principal">Principal</option>
          </select>
          <select
            value={filterBcsBatch}
            onChange={(e) => setFilterBcsBatch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full lg:w-auto"
          >
            <option value="">All Batches</option>
            <option value="00">No BCS</option>
            <option value="38">38th</option>
            <option value="39">39th</option>
            <option value="40">40th</option>
            <option value="41">41st</option>
            <option value="42">42nd</option>
            <option value="43">43rd</option>
            <option value="44">44th</option>
            <option value="45">45th</option>
            <option value="46">46th</option>
            <option value="47">47th</option>
            <option value="48">48th</option>
            <option value="49">49th</option>
            <option value="50">50th</option>
          </select>
          <button
            onClick={() => {
              setSearch("");
              setFilterDivision("");
              setFilterSubject("");
              setFilterDesignation("");
              setFilterBcsBatch("");
            }}
            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition w-full sm:col-span-2 lg:w-auto"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Members count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {members.length} members
      </p>

      {/* Members View */}
      <div>
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow py-8">
            <p className="text-gray-400 text-center">No members found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Member ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Designation</th>
                    <th className="px-4 py-3 text-left">Subject</th>
                    <th className="px-4 py-3 text-left">Division</th>
                    <th className="px-4 py-3 text-left">Institute</th>
                    <th className="px-4 py-3 text-left">BCS Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member.uid} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-green-700">{member.memberId}</td>
                      <td className="px-4 py-3">{member.name}</td>
                      <td className="px-4 py-3">{member.designation}</td>
                      <td className="px-4 py-3">{member.subject}</td>
                      <td className="px-4 py-3">{member.division}</td>
                      <td className="px-4 py-3">{member.institute}</td>
                      <td className="px-4 py-3">
                        {member.bcsBatch === "00" ? "No BCS" : `${member.bcsBatch}th BCS`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Hidden on Desktop) */}
<div className="grid grid-cols-1 gap-4 md:hidden">
  {filtered.map((member) => (
    <div key={member.uid} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Member ID</p>
          <p className="text-sm font-bold text-green-700">{member.memberId}</p>
        </div>
        <span className="bg-green-700 text-white px-3 py-1 rounded-full text-xs font-medium">
          {member.bcsBatch === "00" ? "No BCS" : `${member.bcsBatch}th BCS`}
        </span>
      </div>

      {/* Name */}
      <p className="text-base font-bold text-gray-800 mb-3">{member.name}</p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Designation</p>
          <p className="text-xs font-semibold text-gray-700">{member.designation}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Subject</p>
          <p className="text-xs font-semibold text-gray-700">{member.subject}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Division</p>
          <p className="text-xs font-semibold text-gray-700">{member.division}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Institute</p>
          <p className="text-xs font-semibold text-gray-700 truncate">{member.institute}</p>
        </div>
      </div>

    </div>
  ))}
</div>
          </>
        )}
      </div>
    </main>
  );
}