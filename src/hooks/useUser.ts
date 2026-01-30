import { useState, useEffect, useCallback, useMemo } from "react";

const USER_STORAGE_KEY = "user_profile";
const REGION_STORAGE_KEY = "user_region";

export interface UserProfile {
  email: string;
  name: string;
  picture: string;
  nickname: string;
  birth: string; // "yyyy.MM.dd" 형식
  gender: "M" | "F";
}

export interface UserRegion {
  sido: string;
  gugun: string;
}

export const useUser = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [region, setRegion] = useState<UserRegion | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    // localStorage에서 프로필 정보 로드
    const savedProfile = localStorage.getItem(USER_STORAGE_KEY);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // localStorage에 없으면 sessionStorage에서 회원가입 정보 가져오기
      const signupInfo = sessionStorage.getItem("signupInfo");
      const googleUser = sessionStorage.getItem("googleUser");
      
      if (signupInfo && googleUser) {
        const signup = JSON.parse(signupInfo);
        const google = JSON.parse(googleUser);
        
        const userProfile: UserProfile = {
          email: google.email,
          name: google.name,
          picture: google.picture,
          nickname: signup.nickname,
          birth: signup.birth,
          gender: signup.gender,
        };
        
        setProfile(userProfile);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
      }
    }

    // localStorage에서 지역 정보 로드
    const savedRegion = localStorage.getItem(REGION_STORAGE_KEY);
    if (savedRegion) {
      setRegion(JSON.parse(savedRegion));
    } else {
      // localStorage에 없으면 sessionStorage에서 지역 정보 가져오기
      const userRegion = sessionStorage.getItem("userRegion");
      if (userRegion) {
        const regionData = JSON.parse(userRegion);
        setRegion(regionData);
        localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(regionData));
      }
    }
  }, []);

  // 프로필 업데이트
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 지역 업데이트
  const updateRegion = useCallback((newRegion: UserRegion) => {
    setRegion(newRegion);
    localStorage.setItem(REGION_STORAGE_KEY, JSON.stringify(newRegion));
  }, []);

  // 생년월일로부터 나이 계산
  const age = useMemo(() => {
    if (!profile?.birth) return null;
    
    try {
      // "yyyy.MM.dd" 형식을 "yyyy-MM-dd"로 변환
      const birthDate = new Date(profile.birth.replace(/\./g, "-"));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age}세`;
    } catch {
      return null;
    }
  }, [profile?.birth]);

  // 주소 문자열 생성
  const address = useMemo(() => {
    if (!region) return null;
    return `${region.sido} ${region.gugun} 거주`;
  }, [region]);

  // 프로필 표시용 이름 (닉네임 우선, 없으면 이름)
  const displayName = useMemo(() => {
    return profile?.nickname || profile?.name || "";
  }, [profile?.nickname, profile?.name]);

  return {
    profile,
    region,
    age,
    address,
    displayName,
    updateProfile,
    updateRegion,
  };
};


