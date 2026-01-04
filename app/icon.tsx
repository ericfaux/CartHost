import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Load the Fraunces font (same as your Logo)
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

export default async function Icon() {
  // We only need the characters "C" and "H" for the logo
  const frauncesData = await loadGoogleFont('Fraunces', 'CH');

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 320, // Large size for the 512px canvas
          background: 'transparent', // Transparent background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Fraunces',
          fontWeight: 900, // Matching "font-black" from your component
          letterSpacing: '-0.05em', // Matching "tracking-tighter"
        }}
      >
        {/* The "C" in Slate-900 (#0F172A) */}
        <div style={{ color: '#0F172A' }}>C</div>
        
        {/* The "H" in Teal-600 (#0D9488) */}
        <div style={{ color: '#0D9488' }}>H</div>
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
          weight: 900,
        },
      ],
    }
  );
}
