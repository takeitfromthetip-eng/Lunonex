export default function WelcomeLetter() {
  return (
    <section className="p-8 max-w-4xl mx-auto bg-white dark:bg-black rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Welcome to Fortheweebs</h1>
      <p className="mb-4 text-black dark:text-white">
        You are now entering a sovereign space built for creators. Freedom of speech and creativity are sacred here. Post whatever you want—as long as it’s not illegal by definition.
      </p>
      <ul className="list-disc ml-6 mb-4 text-black dark:text-white">
        <li>We ban only for illegal content, intrusive ads, and clickbait fraud.</li>
        <li>Stylized gore, nudity, fandom chaos—fully allowed.</li>
        <li>You retain full creative rights unless you violate the sacred rules.</li>
      </ul>
      <p className="italic text-black dark:text-white">Tips: Explore vaults, drop tributes, and upgrade tiers anytime. You’re free now—run wild.</p>
    </section>
  );
}
