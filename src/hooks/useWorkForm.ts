import { useState, useMemo } from "react";

export const useWorkForm = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [name, setName] = useState(""); 
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [pay, setPay] = useState(10320); 
  const [memo, setMemo] = useState("");
  const [distance, setDistance] = useState(5);

  // 근무 시간 및 총 급여 계산 로직
  const duration = useMemo(() => {
    if (!startTime || !endTime || startTime === endTime) return 0;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  const totalPay = useMemo(() => Math.floor(duration * pay), [duration, pay]);

  // 미사용 변수들을 활용한 검색 액션
  const handleSearch = (keyword: string) => {
    if (!keyword.trim()) return;
    
    // 카카오 장소 검색 API 호출
    const ps = new (window as any).kakao.maps.services.Places();
    setIsSearching(true);
    setHasSearched(true);
    
    ps.keywordSearch(keyword, (data: any, status: any) => {
      if (status === (window as any).kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleSelectPlace = (place: any) => {
    setName(place.place_name);
    setAddress(place.address_name);
    setCategory(place.category_group_name || "기타");
    setIsSearching(false);
    setSearchResults([]); 
    setSearchKeyword(""); 
  };

  const setters = { 
    setSearchKeyword, setDate, setStartTime, setEndTime, 
    setPay, setMemo, setName, setCategory, setDistance,
    setAddress, setSearchResults, setIsSearching, setHasSearched
  };

  const actions = { handleSearch, handleSelectPlace };

  return {
    states: { 
      searchKeyword, name, address, category, searchResults, 
      isSearching, hasSearched, date, startTime, endTime, 
      pay, memo, duration, totalPay, distance 
    },
    setters, 
    actions 
  };
};