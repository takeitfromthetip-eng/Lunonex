export default function LegalDocuments() {
  return (
    <section className="p-8 max-w-4xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Legal Documents</h1>
      <ul className="space-y-4">
        <li><a href="/terms" className="text-blue-500 underline">Terms of Service</a></li>
        <li><a href="/privacy" className="text-blue-500 underline">Privacy Policy</a></li>
        <li><a href="/creator-agreement" className="text-blue-500 underline">Creator Agreement</a></li>
      </ul>
      <button className="mt-6 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded font-bold transition">I Understand & Accept</button>
    </section>
  );
}
