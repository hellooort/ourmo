# OURMO 데이터베이스 설계

> DB: **Supabase (PostgreSQL)** | Framework: **Next.js** | 쿼리: **Raw SQL (pg / Supabase JS Client)**

---

## 1. ER 다이어그램 (관계도)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │  match_requests   │       │  cart_items   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)          │       │ id (PK)      │
│ email        │   ├──│ from_user_id (FK) │       │ user_id (FK) │──► users.id
│ password     │   ├──│ to_user_id (FK)   │       │ target_id(FK)│──► users.id
│ gender       │   │   │ action            │       │ added_at     │
│ status       │   │   │ created_at        │       └──────────────┘
│ role         │   │   │ rejected_at       │
│ ...          │   │   └──────────────────┘
│              │   │
│              │   │   ┌──────────────────┐
│              │   │   │  profile_links    │
│              │   │   ├──────────────────┤
│              │   └──│ user_id (FK)      │
│              │       │ token (UNIQUE)    │
│              │       │ created_at        │
└──────────────┘       │ expires_at        │
       │               └──────────────────┘
       │
       ▼
┌──────────────┐
│ ideal_types  │  (1:1)
├──────────────┤
│ id (PK)      │
│ user_id (FK) │──► users.id (UNIQUE)
│ height       │
│ age_range    │
│ city         │
│ district     │
│ smoking      │
│ education    │
│ job_type     │
│ salary       │
│ priority     │
└──────────────┘
```

---

## 2. SQL DDL (테이블 생성)

Supabase SQL Editor에 순서대로 실행하면 됩니다.

### 2.1 ENUM 타입 생성

```sql
-- 성별
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');

-- 회원 상태 (가입 후 관리자가 처리)
CREATE TYPE user_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 회원 역할
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- 매칭 요청 상태
CREATE TYPE match_action AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
```

### 2.2 `users` 테이블

```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,               -- bcrypt 해시
    gender        gender       NOT NULL,
    role          user_role    NOT NULL DEFAULT 'USER',
    status        user_status  NOT NULL DEFAULT 'PENDING',
    blocked       BOOLEAN      NOT NULL DEFAULT FALSE,

    -- 프로필 정보
    name          VARCHAR(50)  NOT NULL,
    birth_year    VARCHAR(10)  NOT NULL,                -- '1995년'
    city          VARCHAR(20)  NOT NULL,                -- '서울', '경기', '인천', '그 외 지역'
    district      VARCHAR(20)  NOT NULL DEFAULT '',     -- '동부', '서부', '남부', '북부'
    education     VARCHAR(50)  NOT NULL,
    height        INTEGER      NOT NULL,                -- cm 정수
    job           VARCHAR(100) NOT NULL,                -- 직무 (자유입력)
    job_type      VARCHAR(30)  NOT NULL,                -- 직업 형태 (선택지)
    salary        VARCHAR(50)  NOT NULL,
    smoking       VARCHAR(20)  NOT NULL,
    mbti          VARCHAR(4)   NOT NULL,
    charm         TEXT         NOT NULL DEFAULT '',
    dating_style  TEXT         NOT NULL DEFAULT '',
    phone         VARCHAR(20)  NOT NULL,
    image_url     VARCHAR(500) NOT NULL DEFAULT '',

    -- 서비스 관리
    expires_at    TIMESTAMPTZ,                          -- 만료일 (관리자 설정, NULL이면 무기한)
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_gender_status_blocked ON users (gender, status, blocked);
CREATE INDEX idx_users_status               ON users (status);
CREATE INDEX idx_users_created_at           ON users (created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 2.3 `ideal_types` 테이블 (이상형 정보, users와 1:1)

```sql
CREATE TABLE ideal_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    height      VARCHAR(20)  NOT NULL,    -- '176 ~ 180'
    age_range   VARCHAR(30)  NOT NULL,    -- '1996년 ~ 1994년'
    city        VARCHAR(20)  NOT NULL,
    district    VARCHAR(20)  NOT NULL DEFAULT '',
    smoking     VARCHAR(20)  NOT NULL,
    education   VARCHAR(50)  NOT NULL,
    job_type    VARCHAR(30)  NOT NULL,
    salary      VARCHAR(50)  NOT NULL,
    priority    VARCHAR(20)  NOT NULL     -- '키', '나이', '거주지' 등
);
```

### 2.4 `match_requests` 테이블 (매칭 요청)

```sql
CREATE TABLE match_requests (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action         match_action NOT NULL DEFAULT 'PENDING',

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    rejected_at    TIMESTAMPTZ,            -- 거절 시각 (7일 쿨타임 계산용)

    -- 같은 여성이 같은 남성에게 중복 요청 방지
    UNIQUE (from_user_id, to_user_id)
);

-- 인덱스
CREATE INDEX idx_match_to_user_action ON match_requests (to_user_id, action);
CREATE INDEX idx_match_from_user      ON match_requests (from_user_id);
```

### 2.5 `cart_items` 테이블 (매칭 요청 목록 - 확정 전 임시)

```sql
CREATE TABLE cart_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 같은 상대 중복 담기 방지
    UNIQUE (user_id, target_id)
);

CREATE INDEX idx_cart_user_id ON cart_items (user_id);
```

### 2.6 `profile_links` 테이블 (외부 공유 링크 - 5일 만료)

```sql
CREATE TABLE profile_links (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token       VARCHAR(20)  NOT NULL UNIQUE,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_profile_links_token ON profile_links (token);
```

---

## 3. 테이블 상세 설명

### 3.1 `users` - 회원 테이블

| 컬럼 | 타입 | NULL | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | UUID | NO | auto | PK |
| `email` | VARCHAR(255) | NO | - | 로그인 이메일 (UNIQUE) |
| `password` | VARCHAR(255) | NO | - | bcrypt 해시 |
| `gender` | ENUM | NO | - | MALE / FEMALE |
| `role` | ENUM | NO | USER | USER / ADMIN |
| `status` | ENUM | NO | PENDING | PENDING / APPROVED / REJECTED |
| `blocked` | BOOLEAN | NO | FALSE | 관리자 차단 여부 |
| `name` | VARCHAR(50) | NO | - | 이름 |
| `birth_year` | VARCHAR(10) | NO | - | "1995년" |
| `city` | VARCHAR(20) | NO | - | 시/도 |
| `district` | VARCHAR(20) | NO | '' | 구/군 |
| `education` | VARCHAR(50) | NO | - | 학력 |
| `height` | INTEGER | NO | - | 키 (cm) |
| `job` | VARCHAR(100) | NO | - | 직무 (자유입력) |
| `job_type` | VARCHAR(30) | NO | - | 직업 형태 (선택지) |
| `salary` | VARCHAR(50) | NO | - | 연봉 범위 |
| `smoking` | VARCHAR(20) | NO | - | 흡연 여부 |
| `mbti` | VARCHAR(4) | NO | - | MBTI |
| `charm` | TEXT | NO | '' | 매력포인트 |
| `dating_style` | TEXT | NO | '' | 연애스타일 |
| `phone` | VARCHAR(20) | NO | - | 연락처 |
| `image_url` | VARCHAR(500) | NO | '' | 프로필 이미지 URL |
| `expires_at` | TIMESTAMPTZ | YES | NULL | 서비스 만료일 |
| `created_at` | TIMESTAMPTZ | NO | NOW() | 가입일 |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | 수정일 (트리거 자동 갱신) |

**설계 포인트:**
- `height`를 데모에서는 문자열이었지만 → 정수로 변경하여 범위 검색 가능
- `blocked`를 status와 별도 분리: 승인된 사용자도 차단 가능한 구조
- `role` 추가: 관리자를 하드코딩 비밀번호가 아닌 역할 기반으로 관리
- `updated_at`은 트리거로 자동 갱신

### 3.2 `ideal_types` - 이상형 정보

- `user_id`에 UNIQUE 제약 → users와 1:1 관계
- 데모에서는 User에 `idealXxx` 필드를 다 넣었지만, 정규화하여 분리
- 이상형 조건이 추가/변경되어도 users 테이블에 영향 없음

### 3.3 `match_requests` - 매칭 요청

- `UNIQUE(from_user_id, to_user_id)` → 동일 상대에게 중복 요청 불가
- `rejected_at`으로부터 7일이 지나야 재요청 가능 (앱 로직에서 처리)
- 복합 인덱스 `(to_user_id, action)` → 남성이 받은 요청을 상태별로 빠르게 조회

### 3.4 `cart_items` - 매칭 요청 목록 (임시)

- 여성이 남성을 담아두는 임시 목록
- 매칭 요청 확정 시 해당 유저의 cart_items 전체 삭제
- `UNIQUE(user_id, target_id)` → 같은 상대 중복 방지

### 3.5 `profile_links` - 외부 공유 링크

- 관리자가 생성, token으로 접근
- `expires_at` 체크하여 5일 후 만료 처리

---

## 4. 주요 쿼리 패턴

### 여성 페이지: 승인된 남성 프로필 목록 (페이지네이션)

```sql
SELECT u.*, it.*
FROM users u
LEFT JOIN ideal_types it ON it.user_id = u.id
WHERE u.gender = 'MALE'
  AND u.status = 'APPROVED'
  AND u.blocked = FALSE
ORDER BY u.created_at DESC
LIMIT 20 OFFSET 0;
```

### 남성 페이지: 나에게 온 매칭 요청 + 여성 정보 JOIN

```sql
SELECT mr.*, u.name, u.birth_year, u.height, u.city, u.district,
       u.education, u.job_type, u.mbti, u.image_url
FROM match_requests mr
JOIN users u ON u.id = mr.from_user_id
WHERE mr.to_user_id = '해당_남성_UUID'
ORDER BY mr.created_at DESC;
```

### 매칭 요청 생성 전 거절 쿨타임 체크

```sql
-- 7일 이내에 거절된 기록이 있는지 확인
SELECT id FROM match_requests
WHERE from_user_id = '여성_UUID'
  AND to_user_id   = '남성_UUID'
  AND action        = 'REJECTED'
  AND rejected_at   > NOW() - INTERVAL '7 days'
LIMIT 1;
```

### 매칭 요청 확정 (여성이 목록 확정)

```sql
-- 1. 카트에 담긴 남성들에게 매칭 요청 생성
INSERT INTO match_requests (from_user_id, to_user_id)
SELECT user_id, target_id
FROM cart_items
WHERE user_id = '여성_UUID'
ON CONFLICT (from_user_id, to_user_id) DO NOTHING;

-- 2. 카트 비우기
DELETE FROM cart_items WHERE user_id = '여성_UUID';
```

### 남성이 매칭 수락

```sql
UPDATE match_requests
SET action = 'ACCEPTED'
WHERE id = '매칭요청_UUID' AND to_user_id = '남성_UUID';
```

### 남성이 매칭 거절

```sql
UPDATE match_requests
SET action = 'REJECTED', rejected_at = NOW()
WHERE id = '매칭요청_UUID' AND to_user_id = '남성_UUID';
```

### 관리자: 회원 승인 (만료일 30일 설정)

```sql
UPDATE users
SET status = 'APPROVED', expires_at = NOW() + INTERVAL '30 days'
WHERE id = '유저_UUID';
```

### 관리자: 만료 자동 블락 (Cron Job - 하루 1회 실행)

```sql
UPDATE users
SET blocked = TRUE
WHERE expires_at < NOW()
  AND blocked = FALSE
  AND status = 'APPROVED';
```

### 관리자: 매칭 현황 집계 (회원별)

```sql
SELECT u.id, u.name, u.gender,
       COUNT(mr.id)                                    AS total_matches,
       COUNT(CASE WHEN mr.action = 'PENDING'  THEN 1 END) AS pending_count,
       COUNT(CASE WHEN mr.action = 'ACCEPTED' THEN 1 END) AS accepted_count,
       COUNT(CASE WHEN mr.action = 'REJECTED' THEN 1 END) AS rejected_count
FROM users u
LEFT JOIN match_requests mr
  ON mr.from_user_id = u.id OR mr.to_user_id = u.id
GROUP BY u.id, u.name, u.gender
ORDER BY total_matches DESC;
```

---

## 5. Supabase RLS (Row Level Security) 정책

실서비스에서는 Supabase RLS로 데이터 접근을 제한합니다.

```sql
-- RLS 활성화
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideal_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_links  ENABLE ROW LEVEL SECURITY;

-- 본인 프로필만 수정 가능
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 승인된 이성 프로필만 조회 가능
CREATE POLICY "users_select_approved" ON users
    FOR SELECT USING (
        status = 'APPROVED' AND blocked = FALSE
    );

-- 본인의 매칭 요청만 조회 가능
CREATE POLICY "match_select_own" ON match_requests
    FOR SELECT USING (
        auth.uid() = from_user_id OR auth.uid() = to_user_id
    );

-- 본인 카트만 조회/수정
CREATE POLICY "cart_own" ON cart_items
    FOR ALL USING (auth.uid() = user_id);
```

---

## 6. 마이그레이션 전략 (데모 → 실서비스)

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | Supabase 프로젝트 생성 + 위 DDL 실행 | 30분 |
| 2 | `store.ts` → Supabase Client 호출로 교체 | 2~3시간 |
| 3 | 이미지 업로드 → Supabase Storage 연동 | 1시간 |
| 4 | 인증 → Supabase Auth 전환 | 2시간 |
| 5 | RLS 정책 설정 + 테스트 | 1시간 |
| 6 | Vercel Cron 설정 (자동 블락, 쿨타임 해제) | 30분 |
| 7 | 시드 데이터 이관 + 통합 테스트 | 1시간 |

**총 예상: 약 1일 작업**

---

## 7. 향후 확장 고려사항

- **`notifications`**: 매칭 수락/거절 시 상대방에게 알림
- **`messages`**: 매칭 확정 후 채팅 기능
- **`payments`**: 유료 서비스 결제 내역
- **`audit_logs`**: 관리자 액션 기록 (승인, 반려, 차단 등)
- **`reports`**: 사용자 간 신고 기능
