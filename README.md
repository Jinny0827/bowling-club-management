# 🎳 볼링 클럽 관리 시스템

볼링장과 클럽, 사용자를 연결하는 통합 관리 서비스입니다.  
클럽 마스터부터 일반 클럽원까지 권한 기반 접근 제어를 지원하며, 게임 기록·통계·회비 관리를 한 곳에서 처리합니다.

🌐 **서비스 URL**: [bowling-manager.com](https://bowling-manager.com)

---

## 📌 주요 기능

- **클럽 관리**: 볼링장별 클럽 생성 및 운영 관리
- **권한 기반 접근 제어**: 클럽 마스터 / 부마스터 / 클럽원 3단계 권한 체계
- **게임 기록 및 점수 관리**: 경기별 점수 입력 및 이력 조회
- **통계 및 분석**: Chart.js 기반 클럽 활동 통계 시각화
- **회비 관리 시스템**
  - 클럽 총 회비 관리
  - 회원별 회비 납부 기록 (마스터 권한)
  - 납부 현황 조회

---

## 🏗️ 시스템 아키텍처

```
볼링장 (1) ←→ (N) 클럽 (1) ←→ (N) 사용자
```

**배포 구성**
```
사용자 브라우저
    └─► bowling-manager.com (Route53 도메인)
              └─► EC2 (Nginx 리버스 프록시)
                        ├─► Next.js Frontend (PM2)
                        └─► Nest.js Backend (PM2)
                                  └─► PostgreSQL (Supabase)
```

---

## 🛠️ 기술 스택

### Frontend
| 분류 | 기술 |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand / Context API |
| Form | React Hook Form |
| Chart | Chart.js |

### Backend
| 분류 | 기술 |
|---|---|
| Framework | Nest.js |
| Language | TypeScript |
| ORM | Prisma |
| Auth | JWT |
| File Upload | Multer |

### Database
| 분류 | 기술 |
|---|---|
| DB | PostgreSQL |
| 개발 환경 | Supabase |

### Infrastructure
| 분류 | 기술 |
|---|---|
| Cloud | AWS (EC2, Route53) |
| Web Server | Nginx |
| Process | PM2 |
| SSL | Let's Encrypt |

---

## 📁 프로젝트 구조

```
bowling-club-management/
├── frontend/                 # Next.js 앱
│   ├── src/
│   │   ├── components/      # 재사용 컴포넌트
│   │   ├── pages/           # 페이지 라우팅
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── utils/           # 유틸리티 함수
│   │   └── styles/          # CSS/styled-components
│   └── package.json
├── backend/                  # Nest.js API 서버
│   ├── src/
│   │   ├── controllers/     # 컨트롤러
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routes/          # API 라우팅
│   │   ├── middleware/      # 미들웨어
│   │   └── utils/           # 서버 유틸리티
│   └── package.json
└── database/                 # DB 스키마 / 시드 데이터
```

---

## 🚀 로컬 실행

### 사전 요구사항
- Node.js 18+
- PostgreSQL (또는 Supabase 계정)

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

---

## 🔑 환경변수

### backend/.env
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
