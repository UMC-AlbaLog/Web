import { useState, useMemo } from "react";
import { placeService } from "../api/placeService";

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

  const duration = useMemo(() => {
    if (!startTime || !endTime || startTime === endTime) return 0;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  const totalPay = useMemo(() => Math.floor(duration * pay), [duration, pay]);

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const places = await placeService.searchPlaces(keyword);
      setSearchResults(places);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setName(place.placeName || place.place_name);
    setAddress(place.addressName || place.address_name);
    setCategory(place.categoryName || place.category_group_name || "기타");
    setIsSearching(false);
    setHasSearched(false);
    setSearchResults([]); 
    setSearchKeyword(""); 
  };

  const states = { searchKeyword, name, address, category, searchResults, isSearching, hasSearched, date, startTime, endTime, pay, memo, duration, totalPay, distance };
  const setters = { setSearchKeyword, setDate, setStartTime, setEndTime, setPay, setMemo, setName, setCategory, setDistance, setAddress, setSearchResults, setIsSearching, setHasSearched };
  const actions = { handleSearch, handleSelectPlace };

  return { states, setters, actions };
};