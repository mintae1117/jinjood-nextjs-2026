"use client";

import { useState } from "react";
import { Map, MapMarker, ZoomControl, useKakaoLoader } from "react-kakao-maps-sdk";

interface KakaoMapProps {
  lat: number;
  lng: number;
  level?: number;
  markerTitle?: string;
}

export default function KakaoMap({
  lat,
  lng,
  level = 3,
  markerTitle = "진주떡집",
}: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!,
  });
  const [isHovered, setIsHovered] = useState(false);

  if (loading)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          borderRadius: "inherit",
        }}
      >
        지도를 불러오는 중...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          borderRadius: "inherit",
        }}
      >
        지도를 불러올 수 없습니다.
      </div>
    );

  return (
    <Map
      center={{ lat, lng }}
      level={level}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      scrollwheel={false}
    >
      <ZoomControl position="RIGHT" />
      <MapMarker
        position={{ lat, lng }}
        onMouseOver={() => setIsHovered(true)}
        onMouseOut={() => setIsHovered(false)}
      >
        {isHovered && (
          <div
            style={{
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {markerTitle}
          </div>
        )}
      </MapMarker>
    </Map>
  );
}
