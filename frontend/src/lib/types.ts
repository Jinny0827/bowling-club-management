export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role?: 'MASTER' | 'SUB_MASTER' | 'MEMBER';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}


// 250803 추가
// 볼링장 타입 (데이터베이스와 동기화됨)
export interface BowlingCenter {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string;    // phone_number
  laneCount: number;       // lane_count
  parkingAvailable: boolean; // parking_available
  operatingHours?: string; // operating_hours
  imageUrl?: string;       // image_url
  createdAt: string;       // created_at
  updatedAt: string;       // updated_at
}

// 클럽 타입 (데이터베이스와 동기화됨)
export interface Club {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;      // max_members
  monthlyFee: number;      // monthly_fee (Decimal -> number로 변환)
  adminId: string;         // admin_id
  createdAt: string;       // created_at
  updatedAt: string;       // updated_at
}

// 게임 타입 (데이터베이스와 동기화됨)
export interface Game {
  id: string;
  clubId: string;          // club_id
  bowlingCenterId: string; // bowling_center_id
  gameDate: string;        // game_date (Date -> string으로 받음)
  gameType?: string;       // game_type
  createdAt: string;       // created_at

  // 관계형 데이터 (JOIN 시에만 포함)
  club?: Club;
  bowlingCenter?: BowlingCenter;
  scores?: GameScore[];
}

// 게임 점수 타입 (데이터베이스와 동기화됨)
export interface GameScore {
  id: string;
  gameId: string;          // game_id
  userId: string;          // user_id
  score: number;
  gameOrder: number;       // game_order
  createdAt: string;       // created_at

  // 관계형 데이터 (JOIN 시에만 포함)
  game?: Game;
  user?: User;
}

// 클럽 멤버 타입 (데이터베이스와 동기화됨)
export interface ClubMember {
  id: string;
  clubId: string;          // club_id
  userId: string;          // user_id
  role: 'MASTER' | 'SUB_MASTER' | 'MEMBER';
  joinedAt: string;        // joined_at
  averageScore?: number;   // average_score
  createdAt: string;       // created_at

  // 관계형 데이터
  club?: Club;
  user?: User;
}

// ===== API 요청/응답 타입들 =====

// 사용자 통계 타입 (백엔드 DTO와 동기화됨)
export interface UserStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  thisMonthGames: number;
  totalClubs: number;
  recentScores: number[];  // 최근 10게임 점수
}

// 게임 생성 요청
export interface CreateGameRequest {
  clubId: string;
  bowlingCenterId: string;
  gameDate: string;        // YYYY-MM-DD 형식
  gameType?: string;
}

// 게임 점수 추가 요청
export interface CreateGameScoreRequest {
  gameId: string;
  scores: Array<{
    userId: string;
    score: number;
    gameOrder: number;
  }>;
}

// 페이지네이션 응답
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 게임 점수 목록 조회 응답
export type GameScoreListResponse = PaginationResponse<GameScore & {
  game: Game & {
    club: { name: string };
    bowlingCenter: { name: string };
  };
}>;

// 클럽 목록 조회 응답
export type ClubListResponse = PaginationResponse<Club & {
  memberCount: number;
  myRole?: 'MASTER' | 'SUB_MASTER' | 'MEMBER' | null;
}>;

// ===== 필터/정렬 옵션들 =====

// 게임 기록 필터 옵션
export interface GameScoreFilters {
  clubName?: string;
  bowlingCenterName?: string;
  startDate?: string;
  endDate?: string;
  minScore?: number;
  maxScore?: number;
}

// 정렬 옵션
export type SortOption = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';

// 게임 기록 조회 파라미터
export interface GetGameScoresParams {
  page?: number;
  limit?: number;
  sort?: SortOption;
  filters?: GameScoreFilters;
}
