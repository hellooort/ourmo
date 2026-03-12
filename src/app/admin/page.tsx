"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Profile } from "@/lib/types";
import {
  BIRTH_YEARS,
  BIRTH_YEAR_RANGES,
  GENDERS,
  REGIONS,
  EDUCATIONS,
  HEIGHTS,
  JOB_TYPES,
  SALARIES,
  SMOKING,
  MBTI_TYPES,
  PRIORITIES,
} from "@/lib/options";

const ADMIN_PASSWORD = "ourmo2026";

type FieldKey = keyof Profile;

interface FieldConfig {
  key: FieldKey;
  label: string;
  type: "text" | "select" | "phone";
  options?: string[];
  section?: "basic" | "ideal";
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: "name", label: "이름", type: "text", section: "basic" },
  { key: "birthYear", label: "출생년도", type: "select", options: BIRTH_YEARS, section: "basic" },
  { key: "birthYearRange", label: "출생년도 범위", type: "select", options: BIRTH_YEAR_RANGES, section: "basic" },
  { key: "gender", label: "성별", type: "select", options: GENDERS, section: "basic" },
  { key: "region", label: "거주지", type: "select", options: REGIONS, section: "basic" },
  { key: "education", label: "학력", type: "select", options: EDUCATIONS, section: "basic" },
  { key: "height", label: "키", type: "select", options: HEIGHTS, section: "basic" },
  { key: "job", label: "직무", type: "text", section: "basic" },
  { key: "jobType", label: "직업 형태", type: "select", options: JOB_TYPES, section: "basic" },
  { key: "salary", label: "연봉", type: "select", options: SALARIES, section: "basic" },
  { key: "smoking", label: "흡연", type: "select", options: SMOKING, section: "basic" },
  { key: "mbti", label: "MBTI", type: "select", options: MBTI_TYPES, section: "basic" },
  { key: "charm", label: "매력포인트", type: "text", section: "basic" },
  { key: "datingStyle", label: "연애스타일", type: "text", section: "basic" },
  { key: "phone", label: "연락처", type: "phone", section: "basic" },
  { key: "idealHeight", label: "이상형 키", type: "select", options: HEIGHTS, section: "ideal" },
  { key: "idealAge", label: "이상형 나이", type: "select", options: BIRTH_YEAR_RANGES, section: "ideal" },
  { key: "idealRegion", label: "이상형 거주지", type: "select", options: REGIONS, section: "ideal" },
  { key: "idealSmoking", label: "이상형 흡연여부", type: "select", options: SMOKING, section: "ideal" },
  { key: "idealEducation", label: "이상형 학력", type: "select", options: EDUCATIONS, section: "ideal" },
  { key: "idealJobType", label: "이상형 직업 형태", type: "select", options: JOB_TYPES, section: "ideal" },
  { key: "idealSalary", label: "이상형 연봉", type: "select", options: SALARIES, section: "ideal" },
  { key: "priority", label: "우선순위", type: "select", options: PRIORITIES, section: "ideal" },
];

interface FilterState {
  idealHeight: string;
  idealAge: string;
  idealRegion: string;
  idealSmoking: string;
  idealEducation: string;
  idealJobType: string;
  idealSalary: string;
  priority: string;
}

const EMPTY_FILTER: FilterState = {
  idealHeight: "",
  idealAge: "",
  idealRegion: "",
  idealSmoking: "",
  idealEducation: "",
  idealJobType: "",
  idealSalary: "",
  priority: "",
};

const FILTER_OPTIONS: { key: keyof FilterState; label: string; options: string[] }[] = [
  { key: "idealHeight", label: "이상형 키", options: HEIGHTS },
  { key: "idealAge", label: "이상형 나이", options: BIRTH_YEAR_RANGES },
  { key: "idealRegion", label: "이상형 거주지", options: REGIONS },
  { key: "idealSmoking", label: "이상형 흡연여부", options: SMOKING },
  { key: "idealEducation", label: "이상형 학력", options: EDUCATIONS },
  { key: "idealJobType", label: "이상형 직업 형태", options: JOB_TYPES },
  { key: "idealSalary", label: "이상형 연봉", options: SALARIES },
  { key: "priority", label: "우선순위", options: PRIORITIES },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkMap, setLinkMap] = useState<Record<string, { token: string; expiresAt: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTER });
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/profiles");
    const data = await res.json();
    setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchProfiles();
  }, [authed, fetchProfiles]);

  const filteredProfiles = profiles.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const searchable = [p.name, p.gender, p.birthYear, p.region, p.jobType, p.mbti, p.job, p.education, p.phone].join(" ").toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    for (const fKey of Object.keys(filters) as (keyof FilterState)[]) {
      if (filters[fKey] && p[fKey] !== filters[fKey]) return false;
    }
    return true;
  });

  const handleBlock = async (id: string) => {
    await fetch("/api/profiles/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProfiles();
  };

  const handleUpdateField = async (profileId: string, field: FieldKey, value: string) => {
    setSavingField(`${profileId}-${field}`);
    await fetch("/api/profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profileId, [field]: value }),
    });
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, [field]: value } : p))
    );
    setSavingField(null);
  };

  const handleCreateLink = async (profileId: string) => {
    const res = await fetch("/api/profiles/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
    const data = await res.json();
    setLinkMap((prev) => ({ ...prev, [profileId]: data }));
  };

  const handleCopyLink = (profileId: string, token: string) => {
    const url = `${window.location.origin}/profile/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(profileId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-white px-4">
        <div className="bg-card rounded-3xl shadow-xl p-10 max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">관리자 로그인</h1>
            <p className="text-muted-fg text-sm">비밀번호를 입력하세요</p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-5 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            />
            <div className="bg-muted rounded-lg px-4 py-2 text-center">
              <span className="text-xs text-muted-fg">데모 비밀번호: </span>
              <span className="text-sm font-mono font-semibold text-primary">{ADMIN_PASSWORD}</span>
            </div>
          </div>
          <button
            onClick={() => password === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  const basicFields = FIELD_CONFIGS.filter((f) => f.section === "basic");
  const idealFields = FIELD_CONFIGS.filter((f) => f.section === "ideal");

  return (
    <main className="min-h-screen bg-background">
      {/* Image modal */}
      {imageModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setImageModal(null)}>
          <div className="relative max-w-2xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setImageModal(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm flex items-center gap-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
            <img src={imageModal} alt="" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            OUR<span className="text-primary">MO</span>
            <span className="text-muted-fg text-sm font-normal ml-2">관리자</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-fg">
              {filteredProfiles.length !== profiles.length
                ? `${filteredProfiles.length} / ${profiles.length}명`
                : `총 ${profiles.length}명`}
            </span>
            <button onClick={fetchProfiles} className="px-4 py-2 text-sm bg-muted rounded-lg hover:bg-border transition-colors">
              새로고침
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filter bar */}
      <div className="sticky top-[65px] z-40 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="w-4 h-4 text-muted-fg absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="이름, 지역, 직업, MBTI, 연락처 등으로 검색..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-white border-border text-foreground hover:border-primary/30"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              이상형 필터
              {activeFilterCount > 0 && (
                <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-accent">이상형 정보 필터</h3>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ ...EMPTY_FILTER })} className="text-xs text-danger hover:underline">
                    전체 초기화
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FILTER_OPTIONS.map((fo) => (
                  <div key={fo.key} className="space-y-1">
                    <label className="text-xs text-muted-fg">{fo.label}</label>
                    <div className="relative">
                      <select
                        value={filters[fo.key]}
                        onChange={(e) => setFilters((prev) => ({ ...prev, [fo.key]: e.target.value }))}
                        className="w-full text-sm appearance-none bg-muted/40 border border-transparent rounded-lg px-3 py-2 pr-7 cursor-pointer transition-all hover:border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                      >
                        <option value="">전체</option>
                        {fo.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <svg className="w-3.5 h-3.5 text-muted-fg absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-muted-fg">
              {profiles.length === 0 ? "등록된 프로필이 없습니다." : "검색/필터 조건에 맞는 프로필이 없습니다."}
            </p>
            {(search || activeFilterCount > 0) && (
              <button
                onClick={() => { setSearch(""); setFilters({ ...EMPTY_FILTER }); }}
                className="text-sm text-primary hover:underline"
              >
                조건 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map((p, idx) => {
              const isExpanded = expandedId === p.id;
              const link = linkMap[p.id];

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border transition-all ${
                    p.blocked
                      ? "bg-gray-100 border-gray-200 opacity-60"
                      : "bg-card border-border hover:shadow-md"
                  }`}
                >
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <span className={`text-sm font-bold w-8 text-center ${p.blocked ? "text-gray-400" : "text-primary"}`}>
                      {idx + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-fg text-xs">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${p.blocked ? "line-through text-gray-400" : ""}`}>{p.name}</span>
                        {p.blocked && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">블락</span>}
                      </div>
                      <p className={`text-sm truncate ${p.blocked ? "line-through text-gray-400" : "text-muted-fg"}`}>
                        {p.gender} · {p.birthYear} · {p.height}cm · {p.region} · {p.jobType} · {p.mbti}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBlock(p.id); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          p.blocked
                            ? "bg-success/10 text-success hover:bg-success/20"
                            : "bg-danger/10 text-danger hover:bg-danger/20"
                        }`}
                      >
                        {p.blocked ? "해제" : "블락"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (link) handleCopyLink(p.id, link.token);
                          else handleCreateLink(p.id);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                      >
                        {copiedId === p.id ? "복사됨!" : link ? "링크 복사" : "링크 생성"}
                      </button>
                      <svg className={`w-5 h-5 text-muted-fg transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-5">
                      {/* Large image + edit hint */}
                      <div className="flex flex-col sm:flex-row gap-5 mb-5">
                        {/* Large profile image */}
                        <div
                          className="w-full sm:w-48 h-60 rounded-2xl bg-muted overflow-hidden flex-shrink-0 cursor-pointer group relative"
                          onClick={() => p.imageUrl && setImageModal(p.imageUrl)}
                        >
                          {p.imageUrl ? (
                            <>
                              <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-fg text-4xl font-bold">
                              {p.name?.[0] || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                            <p className="text-xs text-muted-fg">드롭다운 클릭 또는 텍스트 더블클릭으로 수정 · 이미지 클릭 시 크게 보기</p>
                          </div>
                          <div className="text-xs text-muted-fg">
                            등록일: {new Date(p.createdAt).toLocaleDateString("ko-KR")}
                          </div>
                          {link && (
                            <div className="p-2.5 bg-accent/5 rounded-lg text-sm inline-block">
                              <span className="text-muted-fg">링크 만료: </span>
                              <span className="font-medium text-accent">{new Date(link.expiresAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Basic info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {basicFields.map((fc) => (
                          <EditableField
                            key={fc.key}
                            config={fc}
                            value={p[fc.key] as string}
                            saving={savingField === `${p.id}-${fc.key}`}
                            onSave={(val) => handleUpdateField(p.id, fc.key, val)}
                            blocked={p.blocked}
                          />
                        ))}
                      </div>

                      {/* Ideal info grid */}
                      <div className="mt-5 pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-accent mb-3">이상형 정보</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {idealFields.map((fc) => (
                            <EditableField
                              key={fc.key}
                              config={fc}
                              value={p[fc.key] as string}
                              saving={savingField === `${p.id}-${fc.key}`}
                              onSave={(val) => handleUpdateField(p.id, fc.key, val)}
                              blocked={p.blocked}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function EditableField({
  config,
  value,
  saving,
  onSave,
  blocked,
}: {
  config: FieldConfig;
  value: string;
  saving: boolean;
  onSave: (val: string) => void;
  blocked: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitText = () => {
    setEditing(false);
    if (draft.trim() !== value) {
      onSave(draft.trim());
    }
  };

  if (config.type === "select" && config.options) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-fg">{config.label}</p>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onSave(e.target.value)}
            disabled={blocked}
            className={`w-full text-sm font-medium appearance-none bg-muted/40 border border-transparent rounded-lg px-3 py-2 pr-8 cursor-pointer transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              saving ? "opacity-50" : ""
            } ${blocked ? "line-through text-gray-400" : ""}`}
          >
            <option value="">-</option>
            {config.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <svg className="w-4 h-4 text-muted-fg absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-fg">{config.label}</p>
      {editing ? (
        <input
          ref={inputRef}
          type={config.type === "phone" ? "tel" : "text"}
          value={draft}
          onChange={(e) => {
            if (config.type === "phone") {
              const val = e.target.value.replace(/[^0-9]/g, "");
              if (val.length <= 11) setDraft(val);
            } else {
              setDraft(e.target.value);
            }
          }}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitText();
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          className={`w-full text-sm font-medium bg-white border border-primary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            config.type === "phone" ? "tracking-widest" : ""
          }`}
        />
      ) : (
        <p
          onDoubleClick={() => { if (!blocked) setEditing(true); }}
          className={`text-sm font-medium px-3 py-2 rounded-lg transition-all cursor-default ${
            blocked
              ? "line-through text-gray-400"
              : "hover:bg-primary-light/40 cursor-text border border-transparent hover:border-primary/20"
          } ${saving ? "opacity-50" : ""}`}
          title={blocked ? "" : "더블클릭하여 수정"}
        >
          {value || <span className="text-muted-fg/50">-</span>}
        </p>
      )}
    </div>
  );
}
