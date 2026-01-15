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
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [pay, setPay] = useState(10320);
  const [memo, setMemo] = useState("");

  // 근무 시간 계산 로직
  const duration = useMemo(() => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  // 예상 총 급여 계산 로직
  const totalPay = useMemo(() => Math.floor(duration * pay), [duration, pay]);

  const handleSearch = (keyword: string) => {
    if (!keyword.trim()) return; 
    const ps = new (window as any).kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data: any, status: any) => {
      setHasSearched(true);
      if (status === (window as any).kakao.maps.services.Status.OK) {
        setSearchResults(data);
        setIsSearching(true);
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

  return {
    states: { 
      searchKeyword, name, address, category, searchResults, 
      isSearching, hasSearched, date, startTime, endTime, 
      pay, memo, duration, totalPay
    },
    setters: { setSearchKeyword, setDate, setStartTime, setEndTime, setPay, setMemo, setName, setCategory },
    actions: { handleSearch, handleSelectPlace }
  };
};