type Track = {
  id: string | number;
  title: string;
  creator: string;
  url: string;
};

type MusicFeedProps = {
  tracks: Track[];
};

export default function MusicFeed({ tracks }: MusicFeedProps) {
  return (
    <section className="p-6 bg-white rounded shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Music Discovery</h2>
      <div className="space-y-4">
        {tracks.map((t) => (
          <div key={t.id} className="bg-gray-100 p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{t.title}</h3>
            <p className="text-sm text-gray-600">{t.creator}</p>
            <audio controls src={t.url} className="w-full mt-2" />
          </div>
        ))}
      </div>
    </section>
  );
}
