export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string | null;
    profileImageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}
