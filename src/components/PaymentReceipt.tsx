"use client";

import jsPDF from "jspdf";

interface Payment {
  id: string;
  userName: string;
  memberId: string;
  type: string;
  amount: number;
  month: string;
  method: string;
  transactionId: string;
  status: string;
  approvedBy: string;
  approvedAt: string;
  donationTitle?: string;
}

export function generateReceipt(payment: Payment) {
  const pdf = new jsPDF();

  // Header
  pdf.setFillColor(21, 128, 61);
  pdf.rect(0, 0, 210, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("BCS Non-Cadre TSC Teachers' Association", 105, 18, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Payment Receipt", 105, 30, { align: "center" });

  // Receipt details
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  const startY = 55;
  const lineHeight = 10;

  // Receipt ID
  pdf.setFont("helvetica", "bold");
  pdf.text("Receipt ID:", 20, startY);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.id.slice(0, 12).toUpperCase(), 80, startY);

  // Member Name
  pdf.setFont("helvetica", "bold");
  pdf.text("Member Name:", 20, startY + lineHeight);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.userName, 80, startY + lineHeight);

  // Member ID
  pdf.setFont("helvetica", "bold");
  pdf.text("Member ID:", 20, startY + lineHeight * 2);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.memberId || "N/A", 80, startY + lineHeight * 2);

  // Payment Type
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Type:", 20, startY + lineHeight * 3);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    payment.type === "donation"
      ? `Donation — ${payment.donationTitle || ""}`
      : "Monthly Subscription",
    80,
    startY + lineHeight * 3
  );

  // Month (for subscription)
  if (payment.type === "subscription" && payment.month) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Month:", 20, startY + lineHeight * 4);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      new Date(payment.month + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      80,
      startY + lineHeight * 4
    );
  }

  // Amount
  pdf.setFont("helvetica", "bold");
  pdf.text("Amount:", 20, startY + lineHeight * 5);
  pdf.setFont("helvetica", "normal");
  pdf.text(`BDT ${payment.amount}`, 80, startY + lineHeight * 5);

  // Payment Method
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Method:", 20, startY + lineHeight * 6);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.method, 80, startY + lineHeight * 6);

  // Transaction ID
  pdf.setFont("helvetica", "bold");
  pdf.text("Transaction ID:", 20, startY + lineHeight * 7);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.transactionId, 80, startY + lineHeight * 7);

  // Status
  pdf.setFont("helvetica", "bold");
  pdf.text("Status:", 20, startY + lineHeight * 8);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.status.toUpperCase(), 80, startY + lineHeight * 8);

  // Approved By
  pdf.setFont("helvetica", "bold");
  pdf.text("Verified By:", 20, startY + lineHeight * 9);
  pdf.setFont("helvetica", "normal");
  pdf.text(payment.approvedBy || "N/A", 80, startY + lineHeight * 9);

  // Approved At
  pdf.setFont("helvetica", "bold");
  pdf.text("Verified At:", 20, startY + lineHeight * 10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    payment.approvedAt
      ? new Date(payment.approvedAt).toLocaleString("en-BD")
      : "N/A",
    80,
    startY + lineHeight * 10
  );

  // Divider
  pdf.setDrawColor(21, 128, 61);
  pdf.setLineWidth(0.5);
  pdf.line(20, startY + lineHeight * 11 + 3, 190, startY + lineHeight * 11 + 3);

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "This is an official receipt of BCS Non-Cadre TSC Teachers' Association.",
    105,
    startY + lineHeight * 12 + 5,
    { align: "center" }
  );
  pdf.text(
    `Generated on: ${new Date().toLocaleString("en-BD")}`,
    105,
    startY + lineHeight * 13 + 5,
    { align: "center" }
  );

  // Save
  pdf.save(`receipt-${payment.id.slice(0, 8)}.pdf`);
}