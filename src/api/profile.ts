import { apiRequest } from "./client";
import type { TsoaResponse } from "./types";

export interface Badge {
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  achievedAt: string;
}

export interface RepresentativeHistory {
  storeName: string;
  workPeriod: string;
  totalWorkDays: number;
}

export interface ProfileData {
  userId: string;
  userName: string;
  userBirth: string;
  age: number;
  gender: "male" | "female";
  profileImage: string;
  address: string;
  totalWorkCount: number;
  trustScore: number;
  badges: Badge[];
  representativeHistory: RepresentativeHistory | null;
}

export interface UpdateProfileRequest {
  userName: string;
  userBirth: string;
  gender: "male" | "female";
  profileImage: string;
}

/**
 * 프로필 조회
 */
export async function getProfile(): Promise<ProfileData> {
  const data = await apiRequest<TsoaResponse<ProfileData>>(
    `/api/profile/me`,
    {
      method: "GET",
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("프로필을 가져올 수 없습니다.");
}

/**
 * 프로필 수정
 */
export async function updateProfile(
  profileData: UpdateProfileRequest
): Promise<ProfileData> {
  const data = await apiRequest<TsoaResponse<ProfileData>>(
    `/api/profile/me`,
    {
      method: "PUT",
      body: profileData,
    }
  );

  if (data?.resultType === "SUCCESS" && data.success) {
    return data.success;
  }
  throw new Error("프로필 수정에 실패했습니다.");
}



