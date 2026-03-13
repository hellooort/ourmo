"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MatchRequest } from "@/lib/types";
import { regionLabel } from "@/lib/options";

type EnrichedMatch = MatchRequest & { fromUser?: User };

export default function MalePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  useEffect(() => {
    const stored = localStorage.getItem("ourmo_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    if (u.gender !== "남자") { router.push("/female"); return; }
    setCurrentUser(u);
    fetchData(u.id);
  }, [router]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const [matchRes, femalesRes] = await Promise.all([
      fetch(`/api/match?toUserId=${userId}`),
      fetch("/api/profiles?gender=여자&status=approved"),
    ]);
    const matchData: MatchRequest[] = await matchRes.json();
    const females: User[] = await femalesRes.json();
    const femaleMap = new Map(females.map(f => [f.id, f]));
    setMatches(matchData.map(m => ({ ...m, fromUser: femaleMap.get(m.fromUserId) })));
    setLoading(false);
  };

  const handleAction = async (e: React.MouseEvent, matchId: string, action: "accepted" | "rejected") => {
    e.stopPropagation();
    await fetch("/api/match", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action }),
    });
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, action } : m));
  };

  if (loading || !currentUser) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const filtered = tab === "all" ? matches : matches.filter(m => m.action === tab);
  const pendingCount = matches.filter(m => m.action === "pending").length;
  const acceptedCount = matches.filter(m => m.action === "accepted").length;
  const rejectedCount = matches.filter(m => m.action === "rejected").length;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">OUR<span className="text-primary">MO</span></h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-fg">{currentUser.name}님</span>
            <button onClick={() => { localStorage.removeItem("ourmo_user"); router.push("/login"); }} className="text-xs text-muted-fg hover:text-foreground">로그아웃</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {matches.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 py-4 overflow-x-auto">
              <TabBtn active={tab === "all"} onClick={() => setTab("all")} label="전체" count={matches.length} />
              <TabBtn active={tab === "pending"} onClick={() => setTab("pending")} label="대기중" count={pendingCount} color="warning" />
              <TabBtn active={tab === "accepted"} onClick={() => setTab("accepted")} label="매칭 확정" count={acceptedCount} color="success" />
              <TabBtn active={tab === "rejected"} onClick={() => setTab("rejected")} label="거절" count={rejectedCount} color="muted" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-6">
              {filtered.map((m) => m.fromUser && (
                <div key={m.id} onClick={() => router.push(`/male/${m.fromUser!.id}?matchId=${m.id}`)}
                  className={`group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative ${m.action === "rejected" ? "opacity-60" : ""}`}>
                  <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                    {m.fromUser.imageUrl ? <img src={m.fromUser.imageUrl} alt={m.fromUser.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :
                      <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/20">{m.fromUser.name?.[0]}</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">{m.fromUser.name}</h3>
                      <p className="text-white/80 text-xs sm:text-sm drop-shadow-md mt-0.5">{m.fromUser.birthYear} · {m.fromUser.height}cm</p>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      {m.action === "pending" && <span className="text-[10px] font-bold text-white bg-warning px-2 py-1 rounded-lg shadow-md">대기중</span>}
                      {m.action === "accepted" && <span className="text-[10px] font-bold text-white bg-success px-2 py-1 rounded-lg shadow-md">매칭 확정</span>}
                      {m.action === "rejected" && <span className="text-[10px] font-bold text-white bg-muted-fg px-2 py-1 rounded-lg shadow-md">거절됨</span>}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">{regionLabel(m.fromUser.city, m.fromUser.district)}</span>
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">{m.fromUser.jobType}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-muted text-muted-fg text-xs rounded-full">{m.fromUser.mbti}</span>
                    {/* Quick action */}
                    {m.action === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => handleAction(e, m.id, "accepted")} className="flex-1 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors">매칭 확정</button>
                        <button onClick={(e) => handleAction(e, m.id, "rejected")} className="flex-1 py-2 bg-muted text-muted-fg text-xs font-semibold rounded-xl hover:bg-danger/10 hover:text-danger transition-colors">거절</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function TabBtn({ active, onClick, label, count, color }: { active: boolean; onClick: () => void; label: string; count: number; color?: string }) {
  const colorCls = color === "success" ? "text-success" : color === "warning" ? "text-warning" : color === "muted" ? "text-muted-fg" : "text-foreground";
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${active ? "bg-primary text-white shadow-md" : "bg-white border border-border hover:border-primary/30"}`}>
      {label}
      <span className={`text-xs ${active ? "text-white/80" : colorCls}`}>{count}</span>
    </button>
  );
}

function EmptyState() {
  const tips = [
    "지금 이 순간에도 여성 회원분들이 프로필을 열심히 살펴보고 계세요!",
    "좋은 인연은 조금 기다려야 더 빛나는 법이에요.",
    "프로필 사진을 업데이트하면 선택받을 확률이 3배 높아진다는 사실, 알고 계셨나요?",
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-28 h-28 bg-gradient-to-br from-primary-light to-accent/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <svg className="w-14 h-14 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">아직 들어온 매칭 요청이 없어요</h2>
      <p className="text-muted-fg text-base max-w-md mb-4">
        걱정 마세요! 많은 여성 회원분들이 매일 새로운 프로필을 확인하고 있습니다.
      </p>
      <div className="bg-primary-light/50 rounded-2xl px-6 py-4 max-w-md">
        <p className="text-sm text-primary-dark font-medium">{randomTip}</p>
      </div>
      <p className="text-xs text-muted-fg/60 mt-8">여성 회원이 회원님을 선택하면 여기에 프로필이 표시됩니다</p>
    </div>
  );
}
