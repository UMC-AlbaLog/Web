// 주소를 좌표로 변환하는 지오코딩 함수
export const getCoordsFromAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!(window as any).kakao || !(window as any).kakao.maps) {
      resolve(null);
      return;
    }
    const geocoder = new (window as any).kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === (window as any).kakao.maps.services.Status.OK) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        resolve(null);
      }
    });
  });
};

// 두 좌표 사이의 직선 거리를 계산 (Haversine Formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구 반경 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};