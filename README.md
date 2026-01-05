# 볼링 클럽 관리 시스템

## 프로젝트 구조
```
bowling-club-management/
├── frontend/                 # Next.js 앱
├── backend/                 # Nest.js API 서버
├── docker-compose.yml       # Docker Compose 설정
├── nginx.conf               # Nginx 리버스 프록시 설정
└── database/               # DB 스키마/시드 데이터
```

## 🚀 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/Jinny0827/bowling-club-management.git
cd bowling-club-management
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

---

## 🐳 Docker 배포 (AWS EC2)

### 사전 준비
- AWS 계정
- SSH 키페어
- EC2 인스턴스 (Ubuntu 24.04)
- Docker 및 Docker Compose 설치

### 1. 환경 변수 설정

```bash
# 프로젝트 루트에서
cp .env.example .env
nano .env
```

`.env` 파일 수정:
```bash
DB_NAME=bowling_club_db
DB_USER=postgres
DB_PASSWORD=강력한_비밀번호_입력  # 반드시 변경!
JWT_SECRET=랜덤_32자_이상_문자열  # 반드시 변경!
NODE_ENV=production
```

### 2. Docker 빌드 및 실행

```bash
# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 서비스 상태 확인
docker-compose ps
```

### 3. 데이터베이스 초기화

```bash
# Backend 컨테이너 접속
docker exec -it bowling_backend sh

# Prisma 마이그레이션
npx prisma db push

# 컨테이너 나가기
exit
```

### 4. 서비스 확인

```bash
# 헬스체크
curl http://localhost/health

# API 확인
curl http://localhost/api

# 프론트엔드 확인
curl http://localhost
```

### 5. 중지 및 재시작

```bash
# 중지
docker-compose down

# 재시작
docker-compose up -d

# 전체 재빌드
docker-compose down
docker-compose up -d --build
```

### Docker 명령어 참고

```bash
# 로그 확인
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# 컨테이너 재시작
docker-compose restart backend

# 볼륨 포함 완전 삭제 (데이터 초기화)
docker-compose down -v
```

---

## 📝 개발 환경 요구사항

- **Node.js**: 18.x 이상
- **PostgreSQL**: 13.x 이상 (로컬 개발 시)
- **npm**: 8.x 이상
- **Docker**: 20.x 이상 (배포 시)
- **Docker Compose**: 2.x 이상 (배포 시)

## 🔧 기술 스택

- **백엔드**: NestJS + Prisma + PostgreSQL
- **프론트엔드**: Next.js + TypeScript
- **인증**: JWT
- **데이터베이스**: PostgreSQL
- **컨테이너**: Docker + Docker Compose
- **프록시**: Nginx

## 📂 중요한 파일들

### 개발 환경
- `backend/.env`: 백엔드 환경 변수 (Git에서 제외됨)
- `backend/.env.example`: 백엔드 환경 변수 템플릿
- `backend/prisma/schema.prisma`: 데이터베이스 스키마
- `DATABASE_SPEC.md`: 데이터베이스 명세서

### 배포 환경
- `.env`: Docker Compose 환경 변수 (Git에서 제외됨)
- `.env.example`: Docker Compose 환경 변수 템플릿
- `docker-compose.yml`: Docker 서비스 정의
- `nginx.conf`: Nginx 설정
- `backend/Dockerfile`: 백엔드 컨테이너 이미지
- `frontend/Dockerfile`: 프론트엔드 컨테이너 이미지

## 🚨 보안 주의사항

1. **절대 .env 파일을 Git에 커밋하지 마세요**
2. **JWT_SECRET은 프로덕션에서 강력한 키로 변경하세요**
   ```bash
   # 강력한 랜덤 키 생성
   openssl rand -base64 32
   ```
3. **데이터베이스 비밀번호는 강력하게 설정하세요**
4. **프로덕션 환경에서는 HTTPS 설정 필수**

## 🤝 기여 가이드

1. 이슈 생성
2. 브랜치 생성 (`git checkout -b feature/new-feature`)
3. 커밋 (`git commit -am 'Add some feature'`)
4. 푸시 (`git push origin feature/new-feature`)
5. Pull Request 생성

## 📋 할 일 목록

- [x] 데이터베이스 스키마 설계
- [x] Prisma 설정
- [x] Docker 환경 구성
- [ ] JWT 인증 시스템
- [ ] 클럽 관리 기능
- [ ] 게임 기록 기능
- [ ] 회비 관리 기능
- [ ] 프론트엔드 구현
- [ ] HTTPS 설정 (Let's Encrypt)

## 📞 문의

- GitHub Issues: https://github.com/Jinny0827/bowling-club-management/issues