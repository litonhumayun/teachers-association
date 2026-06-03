export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* About Section */}
      <section className="max-w-4xl mx-auto px-4 py-10">
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
        <h2 className="text-2xl font-bold text-green-700 mb-4">Latest Notices</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-400 text-center">No notices yet.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto px-4 py-6">
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