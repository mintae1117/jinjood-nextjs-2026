"use client";

import { useSyncExternalStore } from "react";

// 구독할 외부 상태가 없다 — 서버/클라이언트 스냅샷만 다르면 된다
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * 서버 렌더에서는 false, 하이드레이션 이후 클라이언트에서는 true.
 *
 * localStorage·sessionStorage에 persist된 값으로 화면을 가를 때 쓴다. 그런 값은
 * 클라이언트 첫 렌더에는 이미 있고 서버에는 없어서, 그대로 쓰면 하이드레이션이 어긋난다.
 * useEffect + setState로도 같은 효과를 낼 수 있지만 이펙트 안의 동기 setState는
 * 연쇄 렌더를 유발해 린트가 막는다.
 */
export function useHasMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
