/* eslint-disable */
import { useState } from "react";

type Profile = {
  displayName?: string;
  bio?: string;
  musicUrl?: string;
  avatar?: string;
};

type ProfileEditorProps = {
  profile: Profile;
};

export default function ProfileEditor({ profile }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [musicUrl, setMusicUrl] = useState(profile.musicUrl || "");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSave = () => {
    // Add save logic here (API call, state update, etc.)
    // Example: { displayName, bio, musicUrl, avatar }
  };

  return (
    <section className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Customize Your Profile</h2>
      <input
        type="text"
        placeholder="Display Name"
        className="mb-2 p-2 border rounded w-full"
        value={displayName}
        onChange={(e) => setDisplayName(e.currentTarget.value)}
      />
      <textarea
        placeholder="Bio"
        className="mb-2 p-2 border rounded w-full"
        value={bio}
        onChange={(e) => setBio(e.currentTarget.value)}
      />
      <input
        type="url"
        placeholder="Background Music URL"
        className="mb-2 p-2 border rounded w-full"
        value={musicUrl}
        onChange={(e) => setMusicUrl(e.currentTarget.value)}
      />
      <input
        type="file"
        accept="image/*"
        className="mb-2"
        title="Upload avatar image"
        onChange={(e) => setAvatar(e.currentTarget.files?.[0] || null)}
      />
      <button
        className="bg-purple-700 text-white px-4 py-2 rounded"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </section>
  );
}
