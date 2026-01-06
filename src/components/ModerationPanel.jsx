/* eslint-disable */
type FlaggedContent = {
  id: string | number;
  reason: string;
  creator: string;
  tier?: string;
};

type ModerationPanelProps = {
  flaggedContent: FlaggedContent[];
  onSealBan?: (id: string | number) => void;
  onDismiss?: (id: string | number) => void;
};

export default function ModerationPanel({
  flaggedContent,
  onSealBan,
  onDismiss,
}: ModerationPanelProps) {
  return (
    <section className="p-6 bg-white rounded shadow max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Council Review Queue</h2>
      <ul className="space-y-4">
        {flaggedContent.map((item) => (
          <li key={item.id} className="border p-4 rounded">
            <p>
              <strong>Flag Reason:</strong> {item.reason}
            </p>
            <p>
              <strong>Creator:</strong> {item.creator}
            </p>
            <p>
              <strong>Tier:</strong> {item.tier}
            </p>
            <button
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => onSealBan?.(item.id)}
            >
              Seal & Ban
            </button>
            <button
              className="mt-2 ml-2 bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => onDismiss?.(item.id)}
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
