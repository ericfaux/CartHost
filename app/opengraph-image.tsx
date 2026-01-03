import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CartHost';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  // Fetch Fraunces Bold font from Google Fonts
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/fraunces/v31/6NUu8FyLNQOQZAnv9bYEvDiSVQ.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Fraunces',
              fontSize: 200,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.08em',
              display: 'flex',
            }}
          >
            <span style={{ color: '#0f172a' }}>C</span>
            <span style={{ color: '#0d9488' }}>H</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Fraunces',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}
