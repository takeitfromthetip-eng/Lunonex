type Notification = {
  id: string | number;
  message: string;
  timestamp: string; // ISO string or formatted
};

type NotificationsProps = {
  notifications: Notification[];
};

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <section className="p-6 bg-gray-100 rounded max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="bg-white p-3 rounded shadow">
            <p>{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.timestamp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
