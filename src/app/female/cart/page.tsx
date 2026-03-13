"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { regionLabel } from "@/lib/options";

export default function MatchRequestListPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartUsers, setCartUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ourmo_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setCurrentUser(u);
    fetchCart(u.id);
  }, [router]);

  const fetchCart = async (userId: string) => {
    setLoading(true);
    const [cartRes, malesRes] = await Promise.all([
      fetch(`/api/cart?userId=${userId}`),
      fetch("/api/profiles?gender=남자&status=approved"),
    ]);
    const cartData: { targetId: string }[] = await cartRes.json();
    const males: User[] = await malesRes.json();
    const ids = new Set(cartData.map(c => c.targetId));
    setCartUsers(males.filter(m => ids.has(m.id)));
    setLoading(false);
  };

  const removeFromList = async (targetId: string) => {
    if (!currentUser) return;
    await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.id, targetId }) });
    setCartUsers(prev => prev.filter(u => u.id !== targetId));
  };

  const handleConfirm = async () => {
    if (!currentUser || cartUsers.length === 0) return;
    setConfirming(true);
    await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: currentUser.id, targetIds: cartUsers.map(u => u.id) }),
    });
    setDone(true);
    setConfirming(false);
  };

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-white px-4">
        <div className="bg-card rounded-3xl shadow-xl p-10 text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold">매칭 요청이 전달되었습니다!</h2>
          <p className="text-muted-fg">상대방이 수락하면 매칭이 완료됩니다.</p>
          <button onClick={() => router.push("/female")} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">
            돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/female")} className="text-muted-fg hover:text-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold flex-1">매칭 요청 목록 ({cartUsers.length}명)</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {cartUsers.length === 0 ? (
          <div className="text-center py-20 text-muted-fg">
            <p className="text-lg">매칭 요청 목록이 비어있습니다</p>
            <p className="text-sm mt-2">마음에 드는 프로필에 하트를 눌러 추가해주세요</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/female/${u.id}`)}>
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {u.imageUrl ? <img src={u.imageUrl} alt={u.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary/20">{u.name?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{u.name}</h3>
                  <p className="text-sm text-muted-fg mt-0.5">{u.birthYear} · {u.height}cm · {regionLabel(u.city, u.district)}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{u.jobType}</span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{u.mbti}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFromList(u.id); }} className="text-muted-fg hover:text-danger transition-colors p-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}

            <div className="pt-4">
              <button onClick={handleConfirm} disabled={confirming}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark transition-colors disabled:opacity-40 shadow-lg">
                {confirming ? "처리 중..." : `${cartUsers.length}명에게 매칭 요청 보내기`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
