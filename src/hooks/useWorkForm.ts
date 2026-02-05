import { useState, useMemo } from "react";
import { placeService } from "../api/placeService";

export const useWorkForm = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [pay, setPay] = useState(10320);
  const [memo, setMemo] = useState("");

  const duration = useMemo(() => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  const totalPay = useMemo(() => Math.floor(duration * pay), [duration, pay]);

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    try {
      const places = await placeService.searchPlaces(keyword);
      setSearchResults(places);
      setIsSearching(true);
    } catch (error) {
      console.error("장소 검색 실패:", error);
      setSearchResults([]);
    }
  };

  const handleSelectPlace = (place: any) => {
    setName(place.placeName);
    setAddress(place.addressName);
    setCategory(place.categoryName || "기타");
    setIsSearching(false);
    setSearchResults([]);
    setSearchKeyword(""); 
  };

  return {
    states: { searchKeyword, name, address, category, searchResults, isSearching, date, startTime, endTime, pay, memo, duration, totalPay },
    setters: { setSearchKeyword, setDate, setStartTime, setEndTime, setPay, setMemo },
    actions: { handleSearch, handleSelectPlace }
  };
};