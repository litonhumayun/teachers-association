"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DonationSettings {
  donationActive: boolean;
  donationAmount: number;
  donationTitle: string;
}

export default function DonationBanner() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [donationSettings, setDonationSettings] = useState<DonationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedIn(true);
        const donationSnap = await getDoc(doc(db, "settings", "donation"));
        if (donationSnap.exists()) {
          const data = donationSnap.data();
          setDonationSettings(data as DonationSettings);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || !loggedIn || !donationSettings?.donationActive) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-blue-800">
            🎁 {donationSettings.donationTitle}
          </h2>
          <p className="text-sm text-blue-600 mt-1">
            A donation of <strong>৳{donationSettings.donationAmount}</strong> is currently active.
          </p>
        </div>
        <Link
          href="/payments/donate"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Donate Now
        </Link>
      </div>
    </div>
  );
}