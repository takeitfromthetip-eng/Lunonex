import LegalDocuments from "./LegalDocuments.js";
import WelcomeLetter from "./WelcomeLetter.js";
import AccountCreation from "./AccountCreation.js";
import LaunchPad from "./LaunchPad.js";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="space-y-16 py-12">
        <LegalDocuments />
        <WelcomeLetter />
        <AccountCreation />
        <LaunchPad />
      </div>
    </main>
  );
}
