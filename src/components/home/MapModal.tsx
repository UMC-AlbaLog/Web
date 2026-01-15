import React, { useEffect } from "react";

interface MapModalProps {
  title: string;
  address: string;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({ title, address, onClose }) => {
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
      };
      const map = new kakao.maps.Map(container, options);

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

          const marker = new kakao.maps.Marker({
            map: map,
            position: coords,
          });

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="width:150px;text-align:center;padding:6px 0;font-size:12px;font-weight:bold;">${title}</div>`
          });
          infowindow.open(map, marker);

          map.setCenter(coords);
        }
      });
    });
  }, [address, title]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-100 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-112.5 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex justify-between items-start border-b border-gray-50">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{address}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-gray-600 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        <div id="map" className="w-full h-75 bg-gray-50"></div>
      </div>
    </div>
  );
};

export default MapModal;