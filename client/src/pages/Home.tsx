import React from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/landing/BottomNav";
import HandleNav from "@/components/landing/HandleNav";
import { NewsEngagement } from "@/components/NewsEngagement";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Coins, Zap, Target } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import FeedbackSwitchDialog from "@/components/home/FeedbackSwitchDialog";
export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Active missions count (live)
  const { data: activeMissions = [] } = useQuery<any[]>({
    queryKey: ["/api/missions/ongoing"],
    queryFn: async () => {
      const res = await fetch("/api/missions/ongoing");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div
      style={{
        background: "#fff",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#222",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top banner shown only when logged out */}
      {!user && <HandleNav />}

      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: "calc(90px + 1rem)",
          marginBottom: 0,
        }}
      >
        {/* Banner */}
        <div
          style={{
            background: "#fff8e1",
            borderBottom: "2px solid #00cfff",
            padding: "16px 20px",
            marginTop: !user ? "10px" : "0",
          }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                Make the switch.
                <span
                  style={{
                    color: "#ff9900",
                    display:
                      typeof window !== "undefined" && window.innerWidth < 480
                        ? "block"
                        : "inline",
                  }}
                >
                  {" "}Grow India’s impact.
                </span>
              </div>
              <div style={{ color: "#444", fontSize: 15 }}>
                Start with a nickname—no sign-in needed. Log switches, see news, and earn impact points.
              </div>
            </div>

            {/* Actions at right end (from Connect page behavior) */}
            <div className="flex items-center gap-2">
              <Link href="/missions">
                <a className="px-4 py-2 rounded-md bg-[#0b2238] text-white hover:bg-[#0d2b4f] font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {user ? "Log New Switch" : "Log a Switch (No Login)"}
                </a>
              </Link>
              <SuggestIdeaButton />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "18px 0",
            borderBottom: "3px solid #00cfff",
            background: "#fff",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <StatBox label="Switches Today" value="2,431" />
          <StatBox label="Impact Points" value="18,920" />
          <StatBox label="Active Missions" value={String(activeMissions.length)} />
        </div>

        {/* Latest News */}
        <SectionTitle title="Latest News" />
        <LatestNewsHome />

        {/* Active Missions (from API) */}
        <SectionTitle title="Active Missions" />
        <HomeMissions />

        {/* GDPR & Privacy */}
        <SectionTitle title="GDPR & Privacy" />
        <div style={cardStyle}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>
            We take privacy seriously.
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15 }}>
            <li>Minimal data by default (handle, points, actions).</li>
            <li>
              Optional <b>Recovery Key</b> lets you restore your handle on a new device.
            </li>
            <li>You can request data export or deletion any time from the Privacy Center.</li>
          </ul>
        </div>

        {/* Disclaimers */}
        <SectionTitle title="Disclaimers" />
        <div
          style={{
            ...cardStyle,
            marginBottom: "1rem",
            paddingBottom: "12px",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.5 }}>
            <li>
              <b>Anonymous progress is device-bound</b> and may be lost if cookies are cleared or you switch devices.
            </li>
            <li>
              Keep your <b>Recovery Key</b> private; we cannot restore it if lost.
            </li>
            <li>Rewards, freebies, and prize draws require a registered account.</li>
          </ul>
        </div>
      </div>

      {/* Persistent Bottom Nav */}
      <BottomNav />
    </div>
  );
}

// Helper Components
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px #eee",
        padding: "10px 18px",
        textAlign: "center",
        minWidth: 90,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22 }}>{value}</div>
      <div style={{ color: "#666", fontSize: 15 }}>{label}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 18, margin: "18px 0 8px 12px" }}>{title}</div>
  );
}

// Latest News (first 2) mirroring News page cards, side-by-side
function LatestNewsHome() {
  type NewsArticle = {
    id: string;
    slug: string;
    title: string;
    description: string;
    publishedAt: string;
    upvotesCount?: number;
    downvotesCount?: number;
    sharesCount?: number;
    commentsCount?: number;
  };

  const { data: latestNews = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", "limit=2"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=2");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="px-2 pb-3">
      {isLoading && <div className="text-sm text-gray-600">Loading...</div>}
      {!isLoading && latestNews.length === 0 && (
        <div className="text-sm text-gray-600">No recent news.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latestNews.slice(0, 2).map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <Link href={`/news/${article.slug}`}>
                <h3 className="text-lg font-semibold hover:text-[#0b2238] cursor-pointer">{article.title}</h3>
              </Link>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 text-sm">
                {article.description?.length > 160
                  ? article.description.slice(0, 160) + "..."
                  : article.description}
              </p>
              <div className="mt-3">
                <NewsEngagement
                  newsId={article.id}
                  newsSlug={article.slug}
                  initialUpvotes={article.upvotesCount || 0}
                  initialDownvotes={article.downvotesCount || 0}
                  initialShares={article.sharesCount || 0}
                  initialComments={article.commentsCount || 0}
                  title={article.title}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-2">
        <Link href="/news">
          <a className="text-[#0b2238] font-semibold">See more</a>
        </Link>
      </div>
    </div>
  );
}

// Home Missions (first 2) styled like Missions page cards
function HomeMissions() {
  type Brand = { id: string; name: string; country: string; isIndian: boolean };
  type Mission = {
    id: string;
    title: string;
    description: string;
    targetCategory: string;
    pointsReward: number;
    startDate: string;
    endDate: string | null;
    status: string;
    impact: string;
    fromBrands?: Brand[];
    toBrands?: Brand[];
  };

  const { data: missions = [], isLoading } = useQuery<Mission[]>({
    queryKey: ["/api/missions", "home"],
    queryFn: async () => {
      const res = await fetch(`/api/missions`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const items = missions.slice(0, 2);

  return (
    <div className="px-2 pb-3">
      {isLoading && <div className="text-sm text-gray-600">Loading...</div>}
      {!isLoading && items.length === 0 && (
        <div className="text-sm text-gray-600">No active missions right now.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((mission) => (
          <Card key={mission.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold">{mission.title}</h3>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 text-sm mb-3 break-words">
                {mission.description?.length > 180
                  ? mission.description.slice(0, 180) + "..."
                  : mission.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <Badge variant="outline">{mission.targetCategory?.replace("_", " ")}</Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Coins className="w-3 h-3" /> {mission.pointsReward} points
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                <Calendar className="w-3 h-3" />
                {mission.endDate
                  ? `Ends ${formatDistanceToNow(new Date(mission.endDate))} from now`
                  : "Always"}
              </div>
              <div className="flex justify-end">
                <Link href="/missions">
                  <Button variant="outline" className="border-[#0b2238] text-[#0b2238] hover:bg-[#0b2238] hover:text-white">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-2">
        <Link href="/missions">
          <a className="text-[#0b2238] font-semibold">See more</a>
        </Link>
      </div>
    </div>
  );
}

// Suggest Idea button + dialog, reusing FeedbackSwitchDialog from Connect
function SuggestIdeaButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md border border-[#0b2238] text-[#0b2238] hover:bg-[#0b2238]/5 font-medium flex items-center gap-2"
      >
        <Target className="h-4 w-4" />
        Suggest Idea
      </button>
      <FeedbackSwitchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
// Common Styles
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 8px #eee",
  padding: "14px 16px",
  margin: "0 10px 14px 10px",
};
