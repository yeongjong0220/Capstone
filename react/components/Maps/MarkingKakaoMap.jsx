import React, { useState } from 'react';
import {Map, MapMarker} from 'react-kakao-maps-sdk'

const KakaoMap = ({getPosition, position}) => {
  
  const center = {
    lat: 35.16060702,
    lng: 126.85188148
  }

  return (
    <Map
      center={center}
      style={{ width: "100%", height: "360px" }}
      level={7}

      onClick={(_, mouseEvent) => {
          const latlng = mouseEvent.latLng
          const clickedPosition = {
            lat: latlng.getLat(),
            lng: latlng.getLng(),
          }

          getPosition(clickedPosition);
        }}
    >
    <MapMarker position={position ?? center} />
    </Map>


  );
};

export default KakaoMap;