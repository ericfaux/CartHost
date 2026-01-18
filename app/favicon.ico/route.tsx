import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Load the Fraunces font
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@900&text=${encodeURIComponent(text)}`;
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

export async function GET() {
  const frauncesData = await loadGoogleFont('Fraunces', 'CH');

  // Generate a 48x48 favicon (Google's recommended minimum size)
  const response = new ImageResponse(
    (
      <div
        style={{
          fontSize: 30,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Fraunces',
          fontWeight: 900,
          letterSpacing: '-0.05em',
        }}
      >
        <div style={{ color: '#0F172A' }}>C</div>
        <div style={{ color: '#0D9488' }}>H</div>
      </div>
    ),
    {
      width: 48,
      height: 48,
      fonts: [
        {
          name: 'Fraunces',
          data: frauncesData,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );

  // Set proper headers for favicon
  response.headers.set('Content-Type', 'image/png');
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return response;
}
