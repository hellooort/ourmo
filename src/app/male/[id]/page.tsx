"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, MatchRequest } from "@/lib/types";
import { regionLabel } from "@/lib/options";

export default function MaleProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [profile, setProfile] = useState<User | null>(null);
  const [match, setMatch] = useState<MatchRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ourmo_user");
    if (!stored) { router.push("/login"); return; }
    fetchProfile();
  }, [id, router]);

  const fetchProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/profiles?gender=여자&status=approved");
    const females: User[] = await res.json();
    const found = females.find(f => f.id === id);
    if (!found) { router.push("/male"); return; }
    setProfile(found);

    if (matchId) {
      const stored = localStorage.getItem("ourmo_user");
      if (stored) {
        const u = JSON.parse(stored);
        const mRes = await fetch(`/api/match?toUserId=${u.id}`);
        const matches: MatchRequest[] = await mRes.json();
        setMatch(matches.find(m => m.id === matchId) || null);
      }
    }
    setLoading(false);
  };

  const handleAction = async (action: "accepted" | "rejected") => {
    if (!matchId) return;
    await fetch("/api/match", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action }),
    });
    setMatch(prev => prev ? { ...prev, action } : null);
  };

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-light via-background to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/male")} className="text-muted-fg hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold flex-1">프로필 상세</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-10">
        {/* Profile card */}
        <div className="bg-card rounded-b-3xl shadow-xl overflow-hidden">
          {/* Image */}
          <div className="relative bg-gradient-to-br from-primary to-primary-dark h-48 flex items-end justify-center">
            <div className="absolute -bottom-14 w-28 h-28 rounded-full border-4 border-white bg-muted overflow-hidden shadow-lg">
              {profile.imageUrl ? <img src={profile.imageUrl} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary/30">{profile.name?.[0] || "?"}</div>}
            </div>
          </div>

          <div className="pt-18 pb-8 px-6 space-y-6">
            <div className="text-center pt-4">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-fg mt-1">{profile.gender} · {profile.birthYear} · {regionLabel(profile.city, profile.district)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="키" value={`${profile.height}cm`} />
              <InfoCard label="학력" value={profile.education} />
              <InfoCard label="직업 형태" value={profile.jobType} />
              <InfoCard label="연봉" value={profile.salary} />
              <InfoCard label="흡연" value={profile.smoking} />
              <InfoCard label="MBTI" value={profile.mbti} />
            </div>

            {profile.job && (
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-fg mb-1">직무</p>
                <p className="text-sm font-medium">{profile.job}</p>
              </div>
            )}
            {profile.charm && (
              <div className="bg-primary-light/60 rounded-xl p-4">
                <p className="text-xs text-primary-dark mb-1">매력포인트</p>
                <p className="text-sm font-medium">{profile.charm}</p>
              </div>
            )}
            {profile.datingStyle && (
              <div className="bg-accent/5 rounded-xl p-4">
                <p className="text-xs text-accent mb-1">연애스타일</p>
                <p className="text-sm font-medium">{profile.datingStyle}</p>
              </div>
            )}

            {/* Match action */}
            {match && (
              <div className="pt-2">
                {match.action === "pending" && (
                  <div className="flex gap-3">
                    <button onClick={() => handleAction("accepted")} className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-dark transition-colors shadow-lg">매칭 확정</button>
                    <button onClick={() => handleAction("rejected")} className="flex-1 py-3.5 bg-muted text-muted-fg rounded-2xl font-bold text-base hover:bg-danger/10 hover:text-danger transition-colors">거절</button>
                  </div>
                )}
                {match.action === "accepted" && (
                  <div className="text-center py-4 bg-success/10 rounded-2xl">
                    <p className="text-success font-bold text-lg">매칭이 확정되었습니다!</p>
                    <p className="text-success/70 text-sm mt-1">멋진 인연이 되길 바랍니다</p>
                  </div>
                )}
                {match.action === "rejected" && (
                  <div className="text-center py-4 bg-muted rounded-2xl">
                    <p className="text-muted-fg font-bold">거절된 요청입니다</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded-xl p-3 text-center">
      <p className="text-xs text-muted-fg">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value || "-"}</p>
    </div>
  );
}
