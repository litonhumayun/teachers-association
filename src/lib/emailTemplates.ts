export const memberApprovedTemplate = (name: string, memberId: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Account Approved! 🎉</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your membership has been approved!</p>
    <p>Your Member ID is: <strong style="color: #15803d;">${memberId}</strong></p>
    <p>You can now login and access all member features.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
      Login Now
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;

export const paymentApprovedTemplate = (name: string, amount: number, month: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Payment Confirmed! ✅</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your payment has been verified and approved.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Amount</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>৳${amount}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Month</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${month}</strong></td>
      </tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/payments" 
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
      View Payments
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;

export const expenseApprovedTemplate = (name: string, title: string, amount: number) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Expense Approved! ✅</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your expense request has been approved.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Title</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${title}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Amount</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>৳${amount}</strong></td>
      </tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/expenses" 
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
      View Expenses
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;

export const transferApprovedTemplate = (name: string, fromInstitute: string, toInstitute: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Transfer Approved! 🔄</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Your transfer request has been approved.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 10px; border: 1px solid #e5e7eb;">From</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${fromInstitute}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">To</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${toInstitute}</strong></td>
      </tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" 
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
      View Profile
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;

export const accountDeletedTemplate = (name: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">Account Deleted</h2>
  <p>Dear <strong>${name}</strong>,</p>
  <p>Your request to delete your account has been processed and approved by the administration.</p>
  <p>Your access to the BCS Non-Cadre TSC Teachers' Association portal has been permanently removed.</p>
  <p>If you believe this was an error, please contact the support team.</p>
</div>
`;

export const paymentRejectedTemplate = (name: string, amount: number, month: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">Payment Status Update</h2>
  <p>Dear <strong>${name}</strong>,</p>
  <p>We are sorry to inform you that your payment of <strong>৳${amount}</strong> for <strong>${month}</strong> was not approved by the administration.</p>
  <p>This is often due to an incorrect Transaction ID or payment mismatch. Please verify your details and try submitting the payment again.</p>
  <p>If you believe this is a mistake, please contact the treasurer.</p>
</div>
`;

export const transferRejectedTemplate = (name: string, from: string, to: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">Transfer Request Update</h2>
  <p>Dear <strong>${name}</strong>,</p>
  <p>We are sorry to inform you that your request to transfer from <strong>${from}</strong> to <strong>${to}</strong> has been declined by the administration.</p>
  <p>If you have any questions or require further clarification, please contact the support team.</p>
</div>
`;

export const expenseRejectedTemplate = (name: string, title: string, amount: number) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #dc2626; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #dc2626;">Expense Update</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are sorry to inform you that your expense request has been <strong>rejected</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <tr style="background-color: #f3f4f6;">
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Title</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${title}</strong></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">Amount</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>৳${amount}</strong></td>
      </tr>
    </table>
    <p style="margin-top: 20px;">Please check the portal for further details or contact the administration if you believe this was an error.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/expenses" 
       style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      View Expenses
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;

export const noticeCreatedTemplate = (name: string, title: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Notice Created! 📢</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>A new notice has been created.</p>
    <p>Title: <strong>${title}</strong></p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/notices"
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
      View Notices
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;
export const documentUploadedTemplate = (name: string, title: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #15803d; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">BCS Non-Cadre TSC Teachers' Association</h1>
  </div>
  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #15803d;">Document Uploaded! 📄</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>A new document has been uploaded.</p>
    <p>Title: <strong>${title}</strong></p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/documents"
       style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
      View Documents
    </a>
  </div>
  <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p>BCS Non-Cadre TSC Teachers' Association</p>
  </div>
</div>
`;