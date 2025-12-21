export default function AccountCreation() {
  return (
    <section className="p-8 max-w-4xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Choose Your Tier</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Mythic Founder", price: "$200", perks: "Full access + CGI tribute + 100% profit" },
          { name: "Legacy Creator", price: "$100", perks: "95% profit + vault access" },
          { name: "Supporter Creator", price: "$50", perks: "85% profit + tribute viewer" },
          { name: "General Access", price: "$15 + $5/month", perks: "80% profit + social media tools" },
          { name: "Free Access", price: "$0", perks: "Social media only" },
        ].map((tier) => (
          <div key={tier.name} className="border border-pink-600 bg-white dark:bg-black p-4 rounded shadow">
            <h3 className="text-xl font-semibold text-black dark:text-white">{tier.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">{tier.perks}</p>
            <p className="mt-2 font-bold text-black dark:text-white">{tier.price}</p>
            <button className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-bold transition">Select</button>
          </div>
        ))}
      </div>
    </section>
  );
}
