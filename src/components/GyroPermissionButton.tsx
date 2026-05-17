import React from 'react';
import { isIOS, useGyroscope } from '../utils/gyroscope';

export const GyroPermissionButton = () => {
  const { permissionNeeded, requestPermission } = useGyroscope();

  if (!isIOS() || !permissionNeeded) return null;

  return (
    <button
      onClick={requestPermission}
      style={{
        position: 'fixed',
        bottom: '6rem',
        right: '1.5rem',
        zIndex: 10000,
        background: 'rgba(0,240,255,0.1)',
        border: '1px solid rgba(0,240,255,0.4)',
        borderRadius: '99px',
        color: 'white',
        padding: '0.6rem 1.2rem',
        fontSize: '0.85rem',
        cursor: 'pointer',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      📱 Enable Tilt
    </button>
  );
};
