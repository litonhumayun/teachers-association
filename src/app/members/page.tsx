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
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Members Directory</h1>

{/* Filters */}
{/* Filters */}
<div className="bg-white rounded-lg shadow p-4 mb-6">
  <div className="flex flex-wrap gap-3 items-center">
    <input
      type="text"
      placeholder="Search name, ID, institute..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-48"
    />
    <select
      value={filterDivision}
      onChange={(e) => setFilterDivision(e.target.value)}
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
      className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
    >
      Clear
    </button>
  </div>
</div>

      {/* Members count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filtered.length} of {members.length} members
      </p>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No members found.</p>
        ) : (
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
        )}
      </div>
    </main>
  );
}