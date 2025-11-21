import React, { useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk'

const ViewKakaoMap = ({ latitude, longitude }) => {
  
  const DEFAULT_LAT = 35.16060702;
  const DEFAULT_LNG = 126.85188148;

  const finalLat = !latitude || isNaN(latitude) ? DEFAULT_LAT : parseFloat(latitude);
  const finalLng = !longitude || isNaN(longitude) ? DEFAULT_LNG : parseFloat(longitude);

  const center = {
    lat: finalLat,
    lng: finalLng
  }

  return (
    <Map
      center={center}
      style={{ width: "100%", height: "360px" }}
      level={3}

    >
       <MapMarker position={center} />
    </Map>


  );
};

export default ViewKakaoMap;