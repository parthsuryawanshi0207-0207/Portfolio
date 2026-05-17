import { useEffect, useState } from 'react';

// Detects iOS specifically (requires permission tap for gyroscope)
export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

export const isTouchDevice = () =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0;

interface GyroState {
  gamma: number;
  beta: number;
}

export const useGyroscope = (): { tilt: GyroState; permissionNeeded: boolean; requestPermission: () => void } => {
  const [tilt, setTilt] = useState<GyroState>({ gamma: 0, beta: 0 });
  const [permissionNeeded, setPermissionNeeded] = useState(isIOS());

  const requestPermission = async () => {
    if (isIOS() && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result === 'granted') setPermissionNeeded(false);
      } catch (_) {}
    } else {
      setPermissionNeeded(false);
    }
  };

  useEffect(() => {
    if (permissionNeeded) return;
    const handler = (e: DeviceOrientationEvent) => {
      setTilt({ gamma: e.gamma ?? 0, beta: e.beta ?? 0 });
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [permissionNeeded]);

  return { tilt, permissionNeeded, requestPermission };
};
