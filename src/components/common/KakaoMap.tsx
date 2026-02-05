"use client";

import { useEffect, useRef } from "react";

interface KakaoMapProps {
  lat: number;
  lng: number;
  level?: number;
  markerTitle?: string;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (
          container: HTMLElement,
          options: { center: unknown; level: number }
        ) => unknown;
        Marker: new (options: { position: unknown; map: unknown }) => unknown;
        InfoWindow: new (options: { content: string }) => {
          open: (map: unknown, marker: unknown) => void;
        };
        ZoomControl: new () => unknown;
        ControlPosition: { RIGHT: unknown };
      };
    };
  }
}

export default function KakaoMap({
  lat,
  lng,
  level = 3,
  markerTitle = "진주떡집",
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: position,
          level,
        });

        const marker = new window.kakao.maps.Marker({
          position,
          map,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px 10px;font-size:13px;font-weight:600;white-space:nowrap;">${markerTitle}</div>`,
        });
        infowindow.open(map, marker);

        // 줌 컨트롤 추가
        (map as Record<string, unknown> & { addControl: (control: unknown, position: unknown) => void }).addControl(
          new window.kakao.maps.ZoomControl(),
          window.kakao.maps.ControlPosition.RIGHT
        );
      });
    };

    // SDK가 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    // 스크립트 태그가 이미 존재하는 경우
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", initMap);
      return;
    }

    // 새로 스크립트 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [lat, lng, level, markerTitle]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
