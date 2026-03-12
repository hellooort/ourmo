import { Profile, ProfileLink } from "./types";

const SEED_PROFILES: Profile[] = [
  {
    id: "demo-001",
    createdAt: "2026-03-10T09:00:00.000Z",
    blocked: false,
    imageUrl: "https://i.pravatar.cc/300?img=32",
    name: "김지우",
    birthYear: "1997년",
    birthYearRange: "2006년 ~ 1997년",
    gender: "여자",
    region: "서울 서부",
    education: "서울 4년제 졸업",
    height: "161 ~ 165",
    job: "IT회사_디자이너",
    jobType: "대기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만",
    smoking: "비흡연",
    mbti: "ENFP",
    charm: "밝은 에너지와 공감 능력이 좋아요",
    datingStyle: "매일 연락하고 주말마다 데이트하는 스타일",
    phone: "01012345678",
    idealHeight: "176 ~ 180",
    idealAge: "1996년 ~ 1994년",
    idealRegion: "서울 서부",
    idealSmoking: "비흡연",
    idealEducation: "서울 4년제 졸업",
    idealJobType: "대기업",
    idealSalary: "6,000만원 이상 ~ 8,000만원 미만",
    priority: "키",
  },
  {
    id: "demo-002",
    createdAt: "2026-03-11T14:30:00.000Z",
    blocked: false,
    imageUrl: "https://i.pravatar.cc/300?img=59",
    name: "박현우",
    birthYear: "1995년",
    birthYearRange: "1996년 ~ 1994년",
    gender: "남자",
    region: "서울 동부",
    education: "SKY카포 졸업",
    height: "176 ~ 180",
    job: "금융회사_애널리스트",
    jobType: "대기업",
    salary: "6,000만원 이상 ~ 8,000만원 미만",
    smoking: "비흡연",
    mbti: "INTJ",
    charm: "차분하고 계획적인 성격, 요리를 잘해요",
    datingStyle: "서로의 시간을 존중하면서 깊게 만나는 스타일",
    phone: "01098765432",
    idealHeight: "161 ~ 165",
    idealAge: "2006년 ~ 1997년",
    idealRegion: "서울 동부",
    idealSmoking: "비흡연",
    idealEducation: "서울 4년제 졸업",
    idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만",
    priority: "연봉",
  },
  {
    id: "demo-003",
    createdAt: "2026-03-12T08:15:00.000Z",
    blocked: false,
    imageUrl: "https://i.pravatar.cc/300?img=47",
    name: "이서연",
    birthYear: "1998년",
    birthYearRange: "2006년 ~ 1997년",
    gender: "여자",
    region: "경기 서부",
    education: "석사 졸업",
    height: "156 ~ 160",
    job: "연구소_연구원",
    jobType: "공기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만",
    smoking: "비흡연",
    mbti: "ISFJ",
    charm: "따뜻하고 배려심이 깊어요, 편지 쓰는 걸 좋아해요",
    datingStyle: "소소한 일상을 함께 나누는 스타일",
    phone: "01055556666",
    idealHeight: "171 ~ 175",
    idealAge: "1996년 ~ 1994년",
    idealRegion: "경기 서부",
    idealSmoking: "비흡연",
    idealEducation: "석사 졸업",
    idealJobType: "중견기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만",
    priority: "학력",
  },
];

let profiles: Profile[] = [...SEED_PROFILES];
let links: ProfileLink[] = [];

export function getProfiles(): Profile[] {
  return profiles;
}

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function addProfile(profile: Profile) {
  profiles.push(profile);
}

export function toggleBlock(id: string): Profile | undefined {
  const profile = profiles.find((p) => p.id === id);
  if (profile) {
    profile.blocked = !profile.blocked;
  }
  return profile;
}

export function getLinks(): ProfileLink[] {
  return links;
}

export function addLink(link: ProfileLink) {
  links.push(link);
}

export function getLinkByToken(token: string): ProfileLink | undefined {
  return links.find((l) => l.token === token);
}
