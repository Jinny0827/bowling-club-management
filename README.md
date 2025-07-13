# 볼링 클럽 관리 시스템

## 프로젝트 구조
```
bowling-club-manager/
├── frontend/                 # Next.js 앱
├── backend/                 # Nest.js API 서버  
└── database/               # DB 스키마/시드 데이터
```

## 🚀 프로젝트 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/username/bowling-club-manager.git
cd bowling-club-manager
```

### 2. 환경 변수 설정

#### 백엔드 환경 변수
```bash
cd backend
cp .env.example .env
```

`.env` 파일을 열어서 실제 값으로 수정:
```bash
# 데이터베이스 URL 수정
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bowling_club_db"

# JWT 시크릿 키 변경 (32자 이상 랜덤 문자열)
JWT_SECRET="your-super-secret-jwt-key-change-this"
```

#### 프론트엔드 환경 변수 (향후 추가)
```bash
cd frontend
cp .env.example .env
```

### 3. 데이터베이스 설정

#### PostgreSQL 설치 및 실행
```bash
# PostgreSQL 설치 (Windows)
# https://www.postgresql.org/download/

# 데이터베이스 생성
psql -U postgres
CREATE DATABASE bowling_club_db;
\q
```

#### Prisma 설정
```bash
cd backend

# 패키지 설치
npm install

# Prisma Client 생성
npx prisma generate

# 데이터베이스 동기화
npx prisma db push
```

### 4. 백엔드 실행
```bash
cd backend
npm run start:dev
```

### 5. 프론트엔드 실행 (향후 추가)
```bash
cd frontend
npm install
npm run dev
```

## 📝 개발 환경 요구사항

- **Node.js**: 18.x 이상
- **PostgreSQL**: 13.x 이상
- **npm**: 8.x 이상

## 🔧 개발 도구

- **백엔드**: NestJS + Prisma + PostgreSQL
- **프론트엔드**: Next.js + TypeScript
- **인증**: JWT
- **데이터베이스**: PostgreSQL

## 📂 중요한 파일들

- `.env`: 환경 변수 (Git에서 제외됨)
- `.env.example`: 환경 변수 템플릿
- `backend/prisma/schema.prisma`: 데이터베이스 스키마
- `DATABASE_SPEC.md`: 데이터베이스 명세서

## 🚨 보안 주의사항

1. **절대 .env 파일을 Git에 커밋하지 마세요**
2. **JWT_SECRET은 프로덕션에서 강력한 키로 변경하세요**
3. **데이터베이스 비밀번호는 강력하게 설정하세요**

## 🤝 기여 가이드

1. 이슈 생성
2. 브랜치 생성 (`git checkout -b feature/new-feature`)
3. 커밋 (`git commit -am 'Add some feature'`)
4. 푸시 (`git push origin feature/new-feature`)
5. Pull Request 생성

## 📋 할 일 목록

- [x] 데이터베이스 스키마 설계
- [x] Prisma 설정
- [ ] JWT 인증 시스템
- [ ] 클럽 관리 기능
- [ ] 게임 기록 기능
- [ ] 회비 관리 기능
- [ ] 프론트엔드 구현