# Node.js 18 기반 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치 (Prisma는 devDependency일 수 있으므로 전체 설치)
RUN npm ci

# 소스 코드 복사
COPY . .

# Prisma Client 생성
RUN npx prisma generate

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]
