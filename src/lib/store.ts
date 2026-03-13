import { User, MatchRequest, CartItem, ProfileLink } from "./types";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const SEED_USERS: User[] = [
  {
    id: "f-001", email: "jiwoo@test.com", password: "1234", gender: "여자", status: "approved", createdAt: "2026-03-10T09:00:00.000Z", expiresAt: "2026-04-10T09:00:00.000Z", blocked: false,
    imageUrl: "/uploads/kimjiwoo.png", name: "김지우", birthYear: "1997년", city: "서울", district: "서부",
    education: "서울 4년제 졸업", height: "163", job: "IT회사_디자이너", jobType: "대기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "비흡연", mbti: "ENFP",
    charm: "밝은 에너지와 공감 능력이 좋아요", datingStyle: "매일 연락하고 주말마다 데이트하는 스타일", phone: "01012345678",
    idealHeight: "176 ~ 180", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "서부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "6,000만원 이상 ~ 8,000만원 미만", priority: "키",
  },
  {
    id: "f-002", email: "seoyeon@test.com", password: "1234", gender: "여자", status: "approved", createdAt: "2026-03-12T08:15:00.000Z", expiresAt: "2026-04-12T08:15:00.000Z", blocked: false,
    imageUrl: "/uploads/leesaeyun.png", name: "이서연", birthYear: "1998년", city: "경기", district: "서부",
    education: "석사 졸업", height: "158", job: "연구소_연구원", jobType: "공기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "비흡연", mbti: "ISFJ",
    charm: "따뜻하고 배려심이 깊어요, 편지 쓰는 걸 좋아해요", datingStyle: "소소한 일상을 함께 나누는 스타일", phone: "01055556666",
    idealHeight: "171 ~ 175", idealAge: "1996년 ~ 1994년", idealCity: "경기", idealDistrict: "서부",
    idealSmoking: "비흡연", idealEducation: "석사 졸업", idealJobType: "중견기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "학력",
  },
  {
    id: "m-001", email: "hyunwoo@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-11T14:30:00.000Z", expiresAt: "2026-04-11T14:30:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "박현우", birthYear: "1995년", city: "서울", district: "동부",
    education: "SKY카포 졸업", height: "178", job: "금융회사_애널리스트", jobType: "대기업",
    salary: "6,000만원 이상 ~ 8,000만원 미만", smoking: "비흡연", mbti: "INTJ",
    charm: "차분하고 계획적인 성격, 요리를 잘해요", datingStyle: "서로의 시간을 존중하면서 깊게 만나는 스타일", phone: "01098765432",
    idealHeight: "161 ~ 165", idealAge: "2006년 ~ 1997년", idealCity: "서울", idealDistrict: "동부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "연봉",
  },
  {
    id: "m-002", email: "junhyuk@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-08T10:00:00.000Z", expiresAt: "2026-04-08T10:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "최준혁", birthYear: "1993년", city: "서울", district: "남부",
    education: "SKY카포 졸업", height: "183", job: "법률사무소_변호사", jobType: "전문직",
    salary: "1억원 이상 ~ 1억 5천 미만", smoking: "비흡연", mbti: "ENTJ",
    charm: "목표 지향적이고 리더십이 강해요", datingStyle: "함께 성장하는 관계를 추구해요", phone: "01011112222",
    idealHeight: "161 ~ 165", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "남부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "학력",
  },
  {
    id: "m-003", email: "doyoon@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-08T11:00:00.000Z", expiresAt: "2026-04-08T11:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "김도윤", birthYear: "1996년", city: "서울", district: "서부",
    education: "서울 4년제 졸업", height: "177", job: "IT회사_백엔드개발자", jobType: "대기업",
    salary: "6,000만원 이상 ~ 8,000만원 미만", smoking: "비흡연", mbti: "INTP",
    charm: "유머 감각이 좋고 새로운 기술에 관심이 많아요", datingStyle: "편하게 대화 나누며 같이 취미 생활하는 스타일", phone: "01022223333",
    idealHeight: "156 ~ 160", idealAge: "2006년 ~ 1997년", idealCity: "서울", idealDistrict: "서부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "거주지",
  },
  {
    id: "m-004", email: "minsu@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-09T09:00:00.000Z", expiresAt: "2026-04-09T09:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "정민수", birthYear: "1994년", city: "경기", district: "동부",
    education: "석사 졸업", height: "173", job: "제약회사_연구원", jobType: "중견기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "비흡연", mbti: "ISFP",
    charm: "감성적이고 음악을 좋아해요, 기타 연주 가능", datingStyle: "카페에서 조용히 시간 보내는 걸 좋아해요", phone: "01033334444",
    idealHeight: "156 ~ 160", idealAge: "1996년 ~ 1994년", idealCity: "경기", idealDistrict: "동부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "중견기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "흡연 여부",
  },
  {
    id: "m-005", email: "seungwoo@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-09T10:00:00.000Z", expiresAt: "2026-04-09T10:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "이승우", birthYear: "1992년", city: "서울", district: "북부",
    education: "의대,치대,한의대,약대 졸업", height: "179", job: "대학병원_내과전공의", jobType: "전문직",
    salary: "8,000만원 이상 ~ 1억원 미만", smoking: "비흡연", mbti: "ESTJ",
    charm: "책임감이 강하고 성실해요", datingStyle: "바쁘지만 시간 내서 꼭 챙기는 스타일", phone: "01044445555",
    idealHeight: "161 ~ 165", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "북부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "전문직",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "연봉",
  },
  {
    id: "m-006", email: "jihoon@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-09T14:00:00.000Z", expiresAt: "2026-04-09T14:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "한지훈", birthYear: "1997년", city: "인천", district: "",
    education: "해외대학교 졸업", height: "182", job: "무역회사_해외영업", jobType: "중견기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "흡연(전자담배)", mbti: "ENFJ",
    charm: "사교적이고 영어 가능, 여행을 좋아해요", datingStyle: "함께 여행 다니며 추억 쌓는 스타일", phone: "01055557777",
    idealHeight: "156 ~ 160", idealAge: "2006년 ~ 1997년", idealCity: "인천", idealDistrict: "",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "나이",
  },
  {
    id: "m-007", email: "taehyun@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-10T08:00:00.000Z", expiresAt: "2026-04-10T08:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "오태현", birthYear: "1990년", city: "서울", district: "동부",
    education: "서울 4년제 졸업", height: "186", job: "스타트업_대표", jobType: "개인사업/자영업",
    salary: "2억 이상 ~", smoking: "비흡연", mbti: "ENTP",
    charm: "도전적이고 아이디어가 넘쳐요", datingStyle: "자유롭지만 진지할 땐 확실한 스타일", phone: "01066668888",
    idealHeight: "166 ~ 170", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "동부",
    idealSmoking: "비흡연", idealEducation: "SKY카포 졸업", idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "직업 형태",
  },
  {
    id: "m-008", email: "sungjin@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-10T15:00:00.000Z", expiresAt: "2026-04-10T15:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "윤성진", birthYear: "1991년", city: "경기", district: "서부",
    education: "기타 4년제 졸업", height: "174", job: "공무원_소방관", jobType: "공무원",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "비흡연", mbti: "ISTP",
    charm: "듬직하고 운동을 좋아해요, 체력이 좋아요", datingStyle: "말보다 행동으로 보여주는 스타일", phone: "01077779999",
    idealHeight: "156 ~ 160", idealAge: "1993년 ~ 1990년", idealCity: "경기", idealDistrict: "서부",
    idealSmoking: "비흡연", idealEducation: "기타 4년제 졸업", idealJobType: "공무원",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "거주지",
  },
  {
    id: "m-009", email: "minjae@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-03-11T09:00:00.000Z", expiresAt: "2026-04-11T09:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "강민재", birthYear: "1998년", city: "서울", district: "남부",
    education: "서울 4년제 졸업", height: "178", job: "광고회사_AE", jobType: "중견기업",
    salary: "3,000만원 이상 ~ 4,000만원 미만", smoking: "비흡연", mbti: "ESFP",
    charm: "밝고 활발해서 분위기 메이커예요", datingStyle: "매일 보고 싶고 스킨십 좋아하는 스타일", phone: "01088880000",
    idealHeight: "156 ~ 160", idealAge: "2006년 ~ 1997년", idealCity: "서울", idealDistrict: "남부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "키",
  },
  // 승인대기 남성 (NEW 딱지 테스트)
  {
    id: "m-010", email: "newguy@test.com", password: "1234", gender: "남자", status: "pending", createdAt: new Date().toISOString(), expiresAt: null, blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "신규남성", birthYear: "1996년", city: "서울", district: "서부",
    education: "서울 4년제 졸업", height: "175", job: "마케팅회사_기획자", jobType: "중견기업",
    salary: "3,000만원 이상 ~ 4,000만원 미만", smoking: "비흡연", mbti: "ENFP",
    charm: "트렌드에 밝고 대화를 잘 이끌어가요", datingStyle: "깜짝 이벤트를 좋아하는 스타일", phone: "01099990000",
    idealHeight: "156 ~ 160", idealAge: "2006년 ~ 1997년", idealCity: "서울", idealDistrict: "서부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "나이",
  },
  // 반려된 남성
  {
    id: "m-011", email: "rejected@test.com", password: "1234", gender: "남자", status: "rejected", createdAt: "2026-03-07T09:00:00.000Z", expiresAt: null, blocked: false,
    imageUrl: "", name: "반려된남성", birthYear: "1988년", city: "경기", district: "북부",
    education: "고등학교 졸업", height: "170", job: "무직", jobType: "프리랜서",
    salary: "~ 3,000만원 미만", smoking: "흡연(연초)", mbti: "ISTP",
    charm: "-", datingStyle: "-", phone: "01000001111",
    idealHeight: "156 ~ 160", idealAge: "2006년 ~ 1997년", idealCity: "경기", idealDistrict: "북부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "키",
  },
  // 차단된 남성 (기존 승인 → 차단)
  {
    id: "m-012", email: "blocked@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-02-15T09:00:00.000Z", expiresAt: "2026-03-15T09:00:00.000Z", blocked: true,
    imageUrl: "/uploads/packhyunwoo.png", name: "차단된남성", birthYear: "1990년", city: "서울", district: "북부",
    education: "서울 4년제 졸업", height: "176", job: "영업직_팀장", jobType: "중견기업",
    salary: "6,000만원 이상 ~ 8,000만원 미만", smoking: "흡연(전자담배)", mbti: "ESTP",
    charm: "넓은 인맥과 추진력", datingStyle: "적극적으로 다가가는 스타일", phone: "01000002222",
    idealHeight: "161 ~ 165", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "북부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "나이",
  },
  // 만료된 남성 (expiresAt 과거)
  {
    id: "m-013", email: "expired@test.com", password: "1234", gender: "남자", status: "approved", createdAt: "2026-01-10T09:00:00.000Z", expiresAt: "2026-02-10T09:00:00.000Z", blocked: false,
    imageUrl: "/uploads/packhyunwoo.png", name: "만료된남성", birthYear: "1989년", city: "인천", district: "",
    education: "기타 4년제 졸업", height: "180", job: "물류회사_관리자", jobType: "중소기업",
    salary: "4,000만원 이상 ~ 6,000만원 미만", smoking: "비흡연", mbti: "ISTJ",
    charm: "꼼꼼하고 시간 약속을 잘 지켜요", datingStyle: "안정적인 관계를 선호해요", phone: "01000003333",
    idealHeight: "156 ~ 160", idealAge: "1993년 ~ 1990년", idealCity: "인천", idealDistrict: "",
    idealSmoking: "비흡연", idealEducation: "기타 4년제 졸업", idealJobType: "중소기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "거주지",
  },
  // 승인된 여성 (매칭 테스트용)
  {
    id: "f-003", email: "yuna@test.com", password: "1234", gender: "여자", status: "approved", createdAt: "2026-03-09T10:00:00.000Z", expiresAt: "2026-04-09T10:00:00.000Z", blocked: false,
    imageUrl: "/uploads/kimjiwoo.png", name: "박유나", birthYear: "1996년", city: "서울", district: "남부",
    education: "SKY카포 졸업", height: "167", job: "회계법인_회계사", jobType: "전문직",
    salary: "6,000만원 이상 ~ 8,000만원 미만", smoking: "비흡연", mbti: "INTJ",
    charm: "논리적이고 독립적이에요", datingStyle: "서로의 공간을 존중하는 스타일", phone: "01077770000",
    idealHeight: "176 ~ 180", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "남부",
    idealSmoking: "비흡연", idealEducation: "SKY카포 졸업", idealJobType: "전문직",
    idealSalary: "8,000만원 이상 ~ 1억원 미만", priority: "연봉",
  },
  // 승인대기 여성 (NEW)
  {
    id: "f-006", email: "newgirl@test.com", password: "1234", gender: "여자", status: "pending", createdAt: new Date().toISOString(), expiresAt: null, blocked: false,
    imageUrl: "/uploads/kimjiwoo.png", name: "신규여성", birthYear: "1999년", city: "서울", district: "동부",
    education: "서울 4년제 졸업", height: "161", job: "스타트업_기획자", jobType: "중소기업",
    salary: "3,000만원 이상 ~ 4,000만원 미만", smoking: "비흡연", mbti: "ENFJ",
    charm: "소통을 잘하고 아이디어가 많아요", datingStyle: "함께 계획 세우는 걸 좋아해요", phone: "01066660000",
    idealHeight: "176 ~ 180", idealAge: "1996년 ~ 1994년", idealCity: "서울", idealDistrict: "동부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "대기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "키",
  },
  // 반려된 여성
  {
    id: "f-004", email: "rejectedgirl@test.com", password: "1234", gender: "여자", status: "rejected", createdAt: "2026-03-05T09:00:00.000Z", expiresAt: null, blocked: false,
    imageUrl: "", name: "반려여성", birthYear: "2000년", city: "경기", district: "남부",
    education: "전문대학교 졸업", height: "160", job: "프리랜서_일러스트레이터", jobType: "프리랜서",
    salary: "~ 3,000만원 미만", smoking: "비흡연", mbti: "INFP",
    charm: "그림을 잘 그려요", datingStyle: "감성적인 데이트를 좋아해요", phone: "01088881111",
    idealHeight: "171 ~ 175", idealAge: "2006년 ~ 1997년", idealCity: "경기", idealDistrict: "남부",
    idealSmoking: "비흡연", idealEducation: "서울 4년제 졸업", idealJobType: "중견기업",
    idealSalary: "3,000만원 이상 ~ 4,000만원 미만", priority: "키",
  },
  // 차단된 여성
  {
    id: "f-005", email: "blockedgirl@test.com", password: "1234", gender: "여자", status: "approved", createdAt: "2026-02-20T09:00:00.000Z", expiresAt: "2026-03-20T09:00:00.000Z", blocked: true,
    imageUrl: "/uploads/leesaeyun.png", name: "차단여성", birthYear: "1996년", city: "서울", district: "동부",
    education: "석사 졸업", height: "162", job: "대학원_연구조교", jobType: "공기업",
    salary: "3,000만원 이상 ~ 4,000만원 미만", smoking: "비흡연", mbti: "ISFJ",
    charm: "차분하고 세심해요", datingStyle: "꾸준한 연락을 선호해요", phone: "01088882222",
    idealHeight: "176 ~ 180", idealAge: "1993년 ~ 1990년", idealCity: "서울", idealDistrict: "동부",
    idealSmoking: "비흡연", idealEducation: "석사 졸업", idealJobType: "공기업",
    idealSalary: "4,000만원 이상 ~ 6,000만원 미만", priority: "학력",
  },
];

const SEED_MATCH_REQUESTS: MatchRequest[] = [
  // 김지우(f-001, approved) → 박현우(m-001, approved): 수락됨
  { id: "mr-001", fromUserId: "f-001", toUserId: "m-001", action: "accepted", createdAt: "2026-03-11T15:00:00.000Z", rejectedAt: null },
  // 김지우(f-001, approved) → 최준혁(m-002, approved): 대기 중
  { id: "mr-002", fromUserId: "f-001", toUserId: "m-002", action: "pending", createdAt: "2026-03-12T10:00:00.000Z", rejectedAt: null },
  // 김지우(f-001, approved) → 김도윤(m-003, approved): 거절됨
  { id: "mr-003", fromUserId: "f-001", toUserId: "m-003", action: "rejected", createdAt: "2026-03-10T12:00:00.000Z", rejectedAt: "2026-03-11T09:00:00.000Z" },
  // 이서연(f-002, approved) → 정민수(m-004, approved): 수락됨
  { id: "mr-004", fromUserId: "f-002", toUserId: "m-004", action: "accepted", createdAt: "2026-03-10T16:00:00.000Z", rejectedAt: null },
  // 이서연(f-002, approved) → 이승우(m-005, approved): 대기 중
  { id: "mr-005", fromUserId: "f-002", toUserId: "m-005", action: "pending", createdAt: "2026-03-12T11:00:00.000Z", rejectedAt: null },
  // 이서연(f-002, approved) → 한지훈(m-006, approved): 거절됨
  { id: "mr-006", fromUserId: "f-002", toUserId: "m-006", action: "rejected", createdAt: "2026-03-09T18:00:00.000Z", rejectedAt: "2026-03-10T08:00:00.000Z" },
  // 박유나(f-003, approved) → 박현우(m-001, approved): 대기 중
  { id: "mr-007", fromUserId: "f-003", toUserId: "m-001", action: "pending", createdAt: "2026-03-12T14:00:00.000Z", rejectedAt: null },
  // 박유나(f-003, approved) → 오태현(m-007, approved): 대기 중
  { id: "mr-008", fromUserId: "f-003", toUserId: "m-007", action: "pending", createdAt: "2026-03-12T14:30:00.000Z", rejectedAt: null },
  // 박유나(f-003, approved) → 강민재(m-009, approved): 수락됨
  { id: "mr-009", fromUserId: "f-003", toUserId: "m-009", action: "accepted", createdAt: "2026-03-11T10:00:00.000Z", rejectedAt: null },
];

const SEED_CART: CartItem[] = [
  // 김지우(f-001)가 이승우(m-005), 한지훈(m-006)을 장바구니에 담아둠
  { userId: "f-001", targetId: "m-005", addedAt: "2026-03-12T12:00:00.000Z" },
  { userId: "f-001", targetId: "m-006", addedAt: "2026-03-12T12:05:00.000Z" },
];

let users: User[] = [...SEED_USERS];
let matchRequests: MatchRequest[] = [...SEED_MATCH_REQUESTS];
let cartItems: CartItem[] = [...SEED_CART];
let profileLinks: ProfileLink[] = [];

// === Users ===
export function getUsers(): User[] { return users; }
export function getUser(id: string): User | undefined { return users.find((u) => u.id === id); }
export function getUserByEmail(email: string): User | undefined { return users.find((u) => u.email === email); }
export function addUser(user: User) { users.push(user); }
export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = users.find((u) => u.id === id);
  if (user) Object.assign(user, updates);
  return user;
}

export function getApprovedMales(): User[] {
  return users.filter((u) => u.gender === "남자" && u.status === "approved" && !u.blocked);
}

export function getApprovedFemales(): User[] {
  return users.filter((u) => u.gender === "여자" && u.status === "approved" && !u.blocked);
}

// === Matches ===
export function getMatchRequests(): MatchRequest[] { return matchRequests; }
export function addMatchRequest(mr: MatchRequest) { matchRequests.push(mr); }
export function getMatchesForUser(toUserId: string): MatchRequest[] {
  return matchRequests.filter((m) => m.toUserId === toUserId);
}
export function getMatchesByFrom(fromUserId: string): MatchRequest[] {
  return matchRequests.filter((m) => m.fromUserId === fromUserId);
}
export function updateMatchAction(id: string, action: MatchRequest["action"]): MatchRequest | undefined {
  const mr = matchRequests.find((m) => m.id === id);
  if (mr) {
    mr.action = action;
    if (action === "rejected") mr.rejectedAt = new Date().toISOString();
  }
  return mr;
}
export function isRejectionCooldown(fromUserId: string, toUserId: string): boolean {
  const mr = matchRequests.find(
    (m) => m.fromUserId === fromUserId && m.toUserId === toUserId && m.action === "rejected" && m.rejectedAt
  );
  if (!mr || !mr.rejectedAt) return false;
  return Date.now() - new Date(mr.rejectedAt).getTime() < SEVEN_DAYS;
}

// === Cart ===
export function getCart(userId: string): CartItem[] { return cartItems.filter((c) => c.userId === userId); }
export function addToCart(item: CartItem) {
  if (!cartItems.find((c) => c.userId === item.userId && c.targetId === item.targetId)) {
    cartItems.push(item);
  }
}
export function removeFromCart(userId: string, targetId: string) {
  cartItems = cartItems.filter((c) => !(c.userId === userId && c.targetId === targetId));
}
export function clearCart(userId: string) {
  cartItems = cartItems.filter((c) => c.userId !== userId);
}

// === Profile Links ===
export function addProfileLink(link: ProfileLink) { profileLinks.push(link); }
export function getProfileLinkByToken(token: string): ProfileLink | undefined {
  return profileLinks.find((l) => l.token === token);
}

// === Cron: auto-block expired users ===
export function runAutoBlock() {
  const now = new Date();
  for (const u of users) {
    if (u.expiresAt && !u.blocked && new Date(u.expiresAt) < now) {
      u.blocked = true;
    }
  }
}

// === Cron: auto-unblock rejected after 7 days ===
export function runCooldownCleanup() {
  const now = Date.now();
  for (const mr of matchRequests) {
    if (mr.action === "rejected" && mr.rejectedAt && now - new Date(mr.rejectedAt).getTime() >= SEVEN_DAYS) {
      mr.action = "pending";
      mr.rejectedAt = null;
    }
  }
}
