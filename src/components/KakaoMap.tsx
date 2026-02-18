import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  address: string;
  storeName: string;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ address, storeName }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapContainer.current) return;

    const { maps } = window.kakao;
    const geocoder = new maps.services.Geocoder();

    // 주소로 좌표를 검색
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === maps.services.Status.OK) {
        const coords = new maps.LatLng(result[0].y, result[0].x);
        const options = { center: coords, level: 3 };
        const map = new maps.Map(mapContainer.current, options);

        const marker = new maps.Marker({ map, position: coords });
        const infowindow = new maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;">${storeName}</div>` });
        infowindow.open(map, marker);
      }
    });
  }, [address, storeName]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default KakaoMap;