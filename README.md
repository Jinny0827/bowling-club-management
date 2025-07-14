# 볼링 클럽 관리 시스템

볼링 클럽의 회원, 게임 기록, 회비를 관리하는 웹 애플리케이션입니다.

## 🏗️ 프로젝트 구조
```
bowling-club-manager/
├── frontend/                 # Next.js 앱
├── backend/                 # Nest.js API 서버  
└── database/               # DB 스키마/시드 데이터
```

## 🛠️ 기술 스택
- **백엔드**: NestJS + Prisma + PostgreSQL
- **프론트엔드**: Next.js + TypeScript (예정)
- **인증**: JWT
- **데이터베이스**: PostgreSQL

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

# 패키지 설치 (PowerShell 권장)
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

- **Node.js**: 18.18 이상 (Prisma 호환성)
- **PostgreSQL**: 13.x 이상
- **npm**: 8.x 이상
- **Git**: 2.x 이상

## 🔧 개발 도구 설정

### WebStorm / IntelliJ 설정

#### 1. 터미널 설정
- **File** → **Settings** → **Tools** → **Terminal**
- **Shell path**: `powershell.exe` (npm 작업용)
- Git 작업은 별도 Git Bash 사용 권장

#### 2. ESLint 설정
- **File** → **Settings** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**
- ✅ **Automatic ESLint configuration** 체크
- ✅ **Run eslint --fix on save** 체크

#### 3. Prettier 설정
- **Languages & Frameworks** → **JavaScript** → **Prettier**
- ✅ **Automatic Prettier configuration** 선택
- ✅ **Run on save** 체크
- ✅ **Run on 'Reformat Code' action** 체크

#### 4. 코드 스타일 통일
- **Editor** → **Code Style** → **TypeScript**
- **Tab size**: `2`
- **Indent**: `2`
- **Use tab character**: 체크 해제 (스페이스 사용)

### VS Code 설정 (선택사항)

`.vscode/settings.json` 파일 생성:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🛠️ 기술 스택 상세

- **백엔드**: NestJS + Prisma + PostgreSQL
- **프론트엔드**: Next.js + TypeScript (예정)
- **인증**: JWT
- **데이터베이스**: PostgreSQL
- **코드 품질**: ESLint + Prettier
- **API 문서**: Swagger (향후 추가)

## 📂 중요한 파일들

- `.env`: 환경 변수 (Git에서 제외됨)
- `.env.example`: 환경 변수 템플릿
- `backend/prisma/schema.prisma`: 데이터베이스 스키마
- `DATABASE_SPEC.md`: 데이터베이스 명세서
- `eslint.config.mjs`: ESLint 설정
- `.prettierrc`: Prettier 설정

## 🚨 개발 시 주의사항

### 보안
1. **절대 .env 파일을 Git에 커밋하지 마세요**
2. **JWT_SECRET은 프로덕션에서 강력한 키로 변경하세요**
3. **데이터베이스 비밀번호는 강력하게 설정하세요**

### 코드 품질
1. **커밋 전 ESLint 에러 확인**: `npm run lint`
2. **Prettier 포맷팅 적용**: `npm run format`
3. **타입 에러 확인**: `npm run build`

### 터미널 사용
- **npm 작업**: PowerShell 사용 권장
- **Git 작업**: Git Bash 사용 가능
- **Node.js 관련 에러 시**: 관리자 권한 PowerShell 사용

## 🤝 기여 가이드

1. 이슈 생성
2. 브랜치 생성 (`git checkout -b feature/new-feature`)
3. 코드 작성 (ESLint 규칙 준수)
4. 커밋 (`git commit -am 'Add some feature'`)
5. 푸시 (`git push origin feature/new-feature`)
6. Pull Request 생성

## 📋 할 일 목록

- [x] 데이터베이스 스키마 설계
- [x] Prisma 설정
- [x] 개발 환경 설정 (ESLint, Prettier)
- [ ] JWT 인증 시스템 (진행 중)
- [ ] 클럽 관리 기능
- [ ] 게임 기록 기능
- [ ] 회비 관리 기능
- [ ] API 문서화 (Swagger)
- [ ] 프론트엔드 구현

## 🐛 문제 해결

### 자주 발생하는 문제들

#### npm install 실패
```bash
# 해결 방법
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Prisma 에러
```bash
# Prisma Client 재생성
npx prisma generate
npx prisma db push
```

#### ESLint/Prettier 충돌
```bash
# 포맷팅 적용
npm run format
npm run lint --fix
```

## 📄 라이선스

MIT License

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issues를 통해 연락해주세요.
