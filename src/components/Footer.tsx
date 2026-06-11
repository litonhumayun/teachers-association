import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-white font-bold text-lg mb-4">BCS Non-Cadre TSC Teachers' Association</h2>
          <p className="text-sm leading-relaxed max-w-sm">
            Dedicated to safeguarding professional rights, ensuring welfare, and driving technical excellence within the Technical School & Colleges across Bangladesh.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-white font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-green-400 transition">Home</Link></li>
            <li><Link href="/notices" className="hover:text-green-400 transition">Latest Notices</Link></li>
            <li><Link href="/members" className="hover:text-green-400 transition">Member Directory</Link></li>
            <li><Link href="/dashboard" className="hover:text-green-400 transition">Dashboard</Link></li>
          </ul>
        </div>

        {/* Contact/Support */}
        <div>
          <h3 className="text-white font-bold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/documents" className="hover:text-green-400 transition">Documents</Link></li>
            <li><Link href="/payments" className="hover:text-green-400 transition">Payments</Link></li>
            <li><Link href="/transfer" className="hover:text-green-400 transition">Transfers</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-5xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© {currentYear} BNTTA. All rights reserved.</p>
        <p>
          Developed by{" "}
          <Link 
            href="https://humayunliton.com" 
            target="_blank" 
            className="text-green-400 hover:underline font-semibold"
          >
            Humayun Kabir Liton
          </Link>
        </p>
      </div>
    </footer>
  );
}