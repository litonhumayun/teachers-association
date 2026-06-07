"use client";

import InstituteSelect from "@/components/InstituteSelect";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {
const [formData, setFormData] = useState({
  name: "",
  designation: "",
  subject: "",
  bcsBatch: "",
  institute: "",
  division: "",
  mobile: "",
  email: "",
  joiningDate: "",
  password: "",
});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      router.push("/dashboard");
    }
  });
  return () => unsubscribe();
}, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};


const handleRegister = async (e: React.SubmitEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
if (
  !formData.name ||
  !formData.designation ||
  !formData.subject ||
  !formData.bcsBatch ||
  !formData.institute ||
  !formData.division ||
  !formData.mobile ||
  !formData.email ||
  !formData.joiningDate ||
  !formData.password
) {
  setError("Please fill in all fields.");
  return;
}

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: formData.name,
      designation: formData.designation,
      subject: formData.subject,
      bcsBatch: formData.bcsBatch,
      institute: formData.institute,
      division: formData.division,
      mobile: formData.mobile,
      email: formData.email,
      joiningDate: formData.joiningDate,
      role: "member",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    setSuccess("Registration successful! Please wait for admin approval.");
  } catch {
    setError("Registration failed. Please try again.");
  }
};

  

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-2 text-green-700">
          BCS Non-Cadre TSC Teachers&apos; Association
        </h1>
        <h2 className="text-xl font-semibold text-center mb-6">Member Registration</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your full name"
              />
            </div>

            <div>
  <label className="block text-sm font-medium mb-1">Designation</label>
  <select
    name="designation"
    value={formData.designation}
    onChange={handleSelect}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select Designation</option>
    <option value="Attached Officer/Other">Attached Officer/Other</option>
    <option value="Junior Instructor">Junior Instructor</option>
    <option value="Instructor">Instructor</option>
    <option value="Chief Instructor">Chief Instructor</option>
    <option value="Principal">Principal</option>
  </select>
</div>
<div>
  <label className="block text-sm font-medium mb-1">Subject</label>
  <select
    name="subject"
    value={formData.subject}
    onChange={handleSelect}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select Subject</option>
    <option value="English">English(11)</option>
    <option value="Bangla">Bangla(22)</option>
    <option value="Mathematics">Mathematics(33)</option>
    <option value="Physics">Physics(44)</option>
    <option value="Chemistry">Chemistry(55)</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium mb-1">BCS Batch</label>
  <select
    name="bcsBatch"
    value={formData.bcsBatch}
    onChange={handleSelect}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select BCS Batch</option>
    <option value="00">No BCS (00)</option>
    <option value="38">38th BCS(38)</option>
    <option value="39">39th BCS(39)</option>
    <option value="40">40th BCS(40)</option>
    <option value="41">41st BCS(41)</option>
    <option value="42">42nd BCS(42)</option>
    <option value="43">43rd BCS(43)</option>
    <option value="44">44th BCS(44)</option>
    <option value="45">45th BCS(45)</option>
    <option value="46">46th BCS(46)</option>
    <option value="47">47th BCS(47)</option>
    <option value="48">48th BCS(48)</option>
    <option value="49">49th BCS(49)</option>
    <option value="50">50th BCS(50)</option>
  </select>
</div>
<div>
  <label className="block text-sm font-medium mb-1">Current Institute</label>
  <InstituteSelect
    value={formData.institute}
    onChange={(value) => setFormData({ ...formData, institute: value })}
  />
</div>
<div>
  <label className="block text-sm font-medium mb-1">Division</label>
  <select
    name="division"
    value={formData.division}
    onChange={handleSelect}
    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select Division</option>
    <option value="Dhaka">Dhaka</option>
    <option value="Chittagong">Chittagong</option>
    <option value="Rajshahi">Rajshahi</option>
    <option value="Khulna">Khulna</option>
    <option value="Barisal">Barisal</option>
    <option value="Sylhet">Sylhet</option>
    <option value="Rangpur">Rangpur</option>
    <option value="Mymensingh">Mymensingh</option>
  </select>
</div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">First Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Minimum 6 characters"
              />
            </div>

          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm mt-4">
  Already have an account?{" "}
  <a href="/login" className="text-green-700 font-medium hover:underline">
    Login here
  </a>
</p>
      </div>
    </main>
  );
}