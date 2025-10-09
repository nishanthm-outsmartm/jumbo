interface NewsItem {
  id: string;
  headline: string;
  date: string;
}

interface NewsListProps {
  news: NewsItem[];
}

export default function NewsList({ news }: NewsListProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">News</h2>
      <ul className="space-y-1">
        {news.map((n) => (
          <li key={n.id} className="rounded-lg border p-3 shadow-sm">
            <h3 className="font-medium">{n.headline}</h3>
            <p className="text-xs text-gray-500">{n.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
