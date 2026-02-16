import React, { useState, useEffect } from "react";
import { searchPlaces, type Place } from "../../api/places";

interface RegionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: Place) => void;
  koreanRegions: string[];
}

const RegionSearchModal: React.FC<RegionSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  koreanRegions,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("서울");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

  const handleSearchPlaces = async () => {
    const searchTerm = searchQuery.trim() || selectedRegion || "";
    
    if (!searchTerm) {
      setSearchError("검색어를 입력하거나 지역을 선택해주세요.");
      return;
    }

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setSearchError("로그인이 필요합니다.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      const results = await searchPlaces(searchTerm);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "장소 검색에 실패했습니다.";
      setSearchError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  const handleConfirm = () => {
    if (!selectedPlace) {
      alert("장소를 선택해주세요.");
      return;
    }
    onSelect(selectedPlace);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPlace(null);
    setSearchError(null);
    setShouldAutoSearch(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedPlace(null);
      setSearchError(null);
      setShouldAutoSearch(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedRegion && shouldAutoSearch) {
      handleSearchPlaces();
    }
  }, [selectedRegion, isOpen, shouldAutoSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">활동 지역 선택</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="장소명 또는 주소를 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchPlaces();
                }
              }}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearchPlaces}
              disabled={isSearching}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              {isSearching ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
          {searchError && (
            <p className="mt-2 text-sm text-red-600">{searchError}</p>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">지역별 찾기</h4>
          <div className="grid grid-cols-4 gap-2">
            {koreanRegions.map((region) => (
              <button
                key={region}
                onClick={() => {
                  setSelectedRegion(region);
                  setSearchQuery("");
                  setSelectedPlace(null);
                  setSearchError(null);
                  setShouldAutoSearch(true);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {isSearching && (
          <div className="mb-6 p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">검색 중...</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">검색 결과 ({searchResults.length}개)</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => handlePlaceSelect(place)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedPlace === place
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{place.name || place.place_name || "이름 없음"}</p>
                  <p className="text-xs text-gray-500 mt-1">{place.address || place.address_name || "주소 없음"}</p>
                  {(place.category || place.category_group_name) && (
                    <p className="text-xs text-gray-400 mt-1">{place.category || place.category_group_name}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSearching && !searchError && searchResults.length === 0 && (searchQuery.trim() || selectedRegion) && (
          <div className="mb-6 p-4 text-center text-sm text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}

        {selectedPlace && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">선택된 장소</p>
            <p className="text-sm font-semibold text-gray-800">{selectedPlace.name}</p>
            <p className="text-xs text-gray-600">{selectedPlace.address}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlace}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionSearchModal;



