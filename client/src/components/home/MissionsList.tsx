interface Mission {
  id: string;
  title: string;
  description: string;
}

interface MissionsListProps {
  missions: Mission[];
}

export default function MissionsList({ missions }: MissionsListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Missions</h2>
      <ul className="space-y-1">
        {missions.map((m) => (
          <li key={m.id} className="rounded-lg border p-3 shadow-sm">
            <h3 className="font-medium">{m.title}</h3>
            <p className="text-sm text-gray-600">{m.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
