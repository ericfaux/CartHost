import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'CartHost - Liability-First Rental Operations';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Helper to load Google Fonts reliably
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url).then((res) => res.text());
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('Failed to load font data');
}

export default async function Image() {
  // Fetch fonts dynamically from Google Fonts CDN
  // This avoids the "<!DOCTYPE" 404 error from local paths
  const [frauncesData, monoData] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/fraunces/v24/6NUu8FyLNQOQZAnv9bYEvDIPfE_hwv8.ttf').then((res) =>
      res.arrayBuffer()
    ),
    fetch('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn5qKSdp6_yAV9_.ttf').then((res) =>
      res.arrayBuffer()
    ),
  ]);

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#F4F1EA', // bg-paper
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 49px, #E5E7EB 49px, #E5E7EB 50px)',
            opacity: 0.3,
            zIndex: 0,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            border: '2px solid #0B1220',
            background: '#FFFFFF',
            padding: '60px 80px',
            boxShadow: '8px 8px 0px 0px rgba(11, 18, 32, 0.1)',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0B1220',
              color: '#FFF',
              padding: '8px 16px',
              borderRadius: '999px',
              fontFamily: 'JetBrains Mono',
              fontSize: 16,
              marginBottom: 30,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Operating System
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontFamily: 'Fraunces',
              fontWeight: 700,
              color: '#0B1220',
              textAlign: 'center',
              lineHeight: 1,
              marginBottom: 20,
            }}
          >
            CartHost
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              fontFamily: 'JetBrains Mono',
              color: '#4B5563',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Liability-First Fleet Management
          </div>
        </div>

        {/* Footer Data */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            color: '#6B7280',
            zIndex: 10,
          }}
        >
          <span>EVIDENCE LOCKER</span>
          <span>•</span>
          <span>WAIVER AUTOMATION</span>
          <span>•</span>
          <span>ASSET TRACKING</span>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
      fonts: [
        {
          name: 'Fraunces',
          data: frauncesData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'JetBrains Mono',
          data: monoData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
