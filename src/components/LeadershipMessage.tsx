"use client";
import { motion } from "framer-motion";
import { User } from "lucide-react"; // Using Lucide as a placeholder for the user icon

export default function Leadership() {
  const leaders = [
    {
      title: "MESSAGE OF THE PRESIDENT",
      name: "Md Imran Hossain",
      role: "President, BCS Non-Cadre TSC Teachers' Association",
      quote: "Together, we are not just educating individuals; we are building the cornerstone of our nation's industrial future. My commitment is to ensure that every TSC teacher is empowered with the recognition, resources, and respect they deserve. Our unity is our greatest strength."
    },
    {
      title: "MESSAGE OF THE SECRETARY",
      name: "Md Tozommul Ali",
      role: "General Secretary, BCS Non-Cadre TSC Teachers' Association",
      quote: "Our dedication goes beyond classroom instruction. We stand as a unified front to protect our professional rights, foster meaningful growth, and drive technical excellence across Bangladesh. Every voice in our association matters, and together, we will achieve our vision."
    }
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Messages</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {leaders.map((leader, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Header Bar */}
            <div className="bg-green-900 py-4 px-6">
              <h3 className="text-white font-bold tracking-wide">{leader.title}</h3>
            </div>
            
            {/* Body */}
            <div className="p-8">
              {/* Image Placeholder:    When you are ready to swap the placeholder, replace  <User className="w-16 h-16 text-gray-400"/> with an <img src="/path-to-your-image.jpg" className="w-full h-full rounded-full object-cover" alt={leader.name} /> */}
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-gray-50">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              
              <p className="text-gray-700 italic leading-relaxed mb-6">"{leader.quote}"</p>
              
              <div className="border-t pt-4">
                <p className="font-bold text-gray-900">— {leader.name}</p>
                <p className="text-sm text-gray-500">{leader.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}