import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #0ea5e9 100%)',
          borderRadius: 18,
          color: 'white',
          fontSize: 34,
          fontWeight: 900,
          letterSpacing: -1,
        }}
      >
        IA
      </div>
    ),
    size
  );
}
