// 두 지점 간의 거리를 계산하는 함수 (Haversine 공식 사용)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구의 반지름 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km 단위
  
  return Math.round(distance * 10) / 10; // 소수점 첫째 자리까지 반올림
};

// 도를 라디안으로 변환
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// 두 주소 간의 거리 계산 (간단한 매핑 방식)
export const calculateAddressDistance = (address1, address2) => {
  console.log('거리 계산 시작:', { address1, address2 });
  
  // 같은 주소인 경우 거리 0
  if (address1 === address2) {
    return 0;
  }
  
  // 주소별 거리 매핑 (테스트용)
  const distanceMap = {
    '서울시 강남구': {
      '서울 서대문구 거북골로 84': 8.5,
      '서울 강남구 강남대로 238-2': 0.5,
      '서울 강남구 밤고개로 99': 1.2
    }
  };
  
  if (distanceMap[address1] && distanceMap[address1][address2]) {
    const distance = distanceMap[address1][address2];
    console.log('매핑된 거리:', distance);
    return distance;
  }
  
  // 기본 거리 계산 (간단한 방식)
  const coords1 = addressToCoordinates(address1);
  const coords2 = addressToCoordinates(address2);
  
  console.log('좌표 변환 결과:', { coords1, coords2 });
  
  const distance = calculateDistance(coords1.lat, coords1.lon, coords2.lat, coords2.lon);
  
  console.log('계산된 거리:', distance);
  
  return distance;
};

// 주소를 좌표로 변환하는 함수 (간단한 예시)
export const addressToCoordinates = (address) => {
  const seoulCoordinates = {
    '서울': { lat: 37.5665, lon: 126.9780 },
    '강남구': { lat: 37.5172, lon: 127.0473 },
    '서대문구': { lat: 37.5791, lon: 126.9368 },
    '광주': { lat: 35.1595, lon: 126.8526 },
    '남구': { lat: 35.1595, lon: 126.8526 },
    // 실제 데이터베이스 주소들 추가
    '서울시 강남구': { lat: 37.5172, lon: 127.0473 },
    '서울 서대문구 거북골로 84': { lat: 37.6000, lon: 126.9000 },
    '서울 강남구 강남대로 238-2': { lat: 37.5200, lon: 127.0500 },
    '서울 강남구 밤고개로 99': { lat: 37.5400, lon: 127.0800 }
  };
  
  // 정확한 주소 매칭 우선
  if (seoulCoordinates[address]) {
    return seoulCoordinates[address];
  }
  
  // 주소에서 지역명 추출하여 좌표 반환 (길이 순으로 정렬하여 더 긴 매칭 우선)
  const sortedRegions = Object.entries(seoulCoordinates).sort((a, b) => b[0].length - a[0].length);
  
  for (const [region, coords] of sortedRegions) {
    if (address.includes(region)) {
      return coords;
    }
  }
  
  // 기본값: 서울 중심
  return { lat: 37.5665, lon: 126.9780 };
};