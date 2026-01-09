import type { ReactNode } from "react";

type MobileShellProps = {
  children: ReactNode;
};

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 text-sm md:text-base">
      <header className="bg-purple-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Fortheweebs</h1>
        <nav className="space-x-4">
          <a href="/feed">Feed</a>
          <a href="/profile">Profile</a>
          <a href="/vault">Vault</a>
        </nav>
      </header>
      <main className="p-4">{children}</main>
      <footer className="bg-gray-200 text-center p-2 text-xs">
        Built by Polotus • All rights reserved
      </footer>
    </div>
  );
}
