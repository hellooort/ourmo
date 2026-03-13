"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@/lib/types";
import { regionLabel } from "@/lib/options";
import { EDUCATIONS, JOB_TYPES, SALARIES, SMOKING } from "@/lib/options";

const HEIGHTS_FILTER = ["151 ~ 155","156 ~ 160","161 ~ 165","166 ~ 170","171 ~ 175","176 ~ 180","181 ~ 185","185 이상"];
const AGE_RANGES = ["2006년 ~ 1997년","1996년 ~ 1994년","1993년 ~ 1990년","1989년 ~ 1987년","1986년 ~ 1984년","1983년 ~ 1981년"];

const FILTER_OPTS = [
  { key: "idealHeight", label: "이상형 키", options: HEIGHTS_FILTER },
  { key: "idealAge", label: "이상형 나이", options: AGE_RANGES },
  { key: "idealSmoking", label: "이상형 흡연", options: SMOKING },
  { key: "idealEducation", label: "이상형 학력", options: EDUCATIONS },
  { key: "idealJobType", label: "이상형 직업형태", options: JOB_TYPES },
  { key: "idealSalary", label: "이상형 연봉", options: SALARIES },
];

const PER_PAGE = 20;

export default function FemalePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [males, setMales] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("ourmo_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    if (u.gender !== "여자") { router.push("/male"); return; }
    setCurrentUser(u);
    fetchData(u.id);
  }, [router]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    const [mRes, cRes] = await Promise.all([
      fetch("/api/profiles?gender=남자&status=approved"),
      fetch(`/api/cart?userId=${userId}`),
    ]);
    const mData = await mRes.json();
    const cData = await cRes.json();
    setMales(mData.filter((m: User) => !m.blocked));
    setCart(new Set(cData.map((c: { targetId: string }) => c.targetId)));
    setLoading(false);
  };

  const toggleCart = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (cart.has(targetId)) {
      await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.id, targetId }) });
      setCart(prev => { const n = new Set(prev); n.delete(targetId); return n; });
    } else {
      await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: currentUser.id, targetId }) });
      setCart(prev => new Set(prev).add(targetId));
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const filtered = males.filter((m) => {
    for (const fKey of Object.keys(filters)) {
      if (filters[fKey] && (m as unknown as Record<string, string>)[fKey] !== filters[fKey]) return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading || !currentUser) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">OUR<span className="text-primary">MO</span></h1>
          <div className="flex items-center gap-3">
            <Link href="/female/cart" className="relative px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              매칭 요청 목록 {cart.size > 0 && <span className="ml-1 bg-primary text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">{cart.size}</span>}
            </Link>
            <button onClick={() => { localStorage.removeItem("ourmo_user"); router.push("/login"); }} className="text-xs text-muted-fg hover:text-foreground">로그아웃</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-3 flex items-center gap-3">
          <span className="text-sm text-muted-fg">{filtered.length}명</span>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${activeFilterCount > 0 ? "bg-accent/10 border-accent/30 text-accent" : "bg-white border-border hover:border-primary/30"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
            필터 {activeFilterCount > 0 && <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          {activeFilterCount > 0 && <button onClick={() => { setFilters({}); setPage(1); }} className="text-xs text-danger hover:underline">초기화</button>}
        </div>
        {showFilters && (
          <div className="bg-white rounded-xl border border-border p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FILTER_OPTS.map(fo => (
              <div key={fo.key} className="space-y-1">
                <label className="text-xs text-muted-fg">{fo.label}</label>
                <select value={filters[fo.key] || ""} onChange={(e) => { setFilters(p => ({ ...p, [fo.key]: e.target.value })); setPage(1); }}
                  className="w-full text-sm appearance-none bg-muted/40 border border-transparent rounded-lg px-3 py-2 pr-7 cursor-pointer hover:border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none">
                  <option value="">전체</option>
                  {fo.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pb-6">
          {paged.map((m) => (
            <div key={m.id} onClick={() => router.push(`/female/${m.id}`)} className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                {m.imageUrl ? <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/20">{m.name?.[0]}</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">{m.name}</h3>
                  <p className="text-white/80 text-xs sm:text-sm drop-shadow-md mt-0.5">{m.birthYear} · {m.height}cm</p>
                </div>
                <button onClick={(e) => toggleCart(e, m.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md z-10">
                  {cart.has(m.id) ? (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                  )}
                </button>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">{regionLabel(m.city, m.district)}</span>
                  <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded-full">{m.jobType}</span>
                </div>
                <span className="px-2 py-0.5 bg-muted text-muted-fg text-xs rounded-full">{m.mbti}</span>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pb-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? "bg-primary text-white" : "bg-white border border-border hover:border-primary/30"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
