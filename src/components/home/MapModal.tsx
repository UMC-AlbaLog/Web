import React, { useEffect } from "react";

interface MapModalProps { title: string; address: string; onClose: () => void; }

const MapModal: React.FC<MapModalProps> = ({ title, address, onClose }) => {
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      const container = document.getElementById("map-element");
      if (!container) return;

      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          
          const map = new kakao.maps.Map(container, { center: coords, level: 3 });

          new kakao.maps.Marker({ 
            position: coords, 
            map: map 
          });

          map.setCenter(coords);
        } else {
          new kakao.maps.Map(container, { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 3 });
        }
      });
    });
  }, [address, title]);

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-200 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-140 p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-left">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="font-black text-2xl text-gray-900">{title}</h3>
            <p className="text-sm font-bold text-gray-400 mt-1">{address}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-800 text-3xl font-light">&times;</button>
        </div>
        
        <div 
          id="map-element" 
          className="w-full h-100 bg-gray-50 rounded-[28px] border border-gray-100 overflow-hidden shadow-inner"
        ></div>
      </div>
    </div>
  );
};

export default MapModal;