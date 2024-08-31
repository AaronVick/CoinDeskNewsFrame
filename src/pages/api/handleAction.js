import { ImageResponse } from '@vercel/og';
import fetchRSS from '../../utils/fetchRSS';  // Adjust the path as needed

export const config = {
  runtime: 'experimental-edge', // Required for Vercel OG
};

export default async function handleAction(req) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const category = 'top';
    let currentIndex = 0;

    if (req.query.index) {
      currentIndex = parseInt(req.query.index, 10);
    }

    const { articles } = await fetchRSS(category);

    if (!articles || articles.length === 0) {
      throw new Error(`No articles found in the RSS feed.`);
    }

    currentIndex = (currentIndex + articles.length) % articles.length;

    const currentArticle = articles[currentIndex];
    const nextIndex = (currentIndex + 1) % articles.length;
    const prevIndex = (currentIndex - 1 + articles.length) % articles.length;

    // Generate the PNG image using Vercel OG
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: '#4B0082',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {currentArticle.title}
          </h1>
          <p
            style={{
              fontSize: '30px',
              textAlign: 'center',
            }}
          >
            {currentArticle.description}
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentArticle.title}</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />

          <meta property="fc:frame:button:1" content="Next" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?index=${nextIndex}" />

          <meta property="fc:frame:button:2" content="Previous" />
          <meta property="fc:frame:button:2:action" content="post" />
          <meta property="fc:frame:button:2:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction?index=${prevIndex}" />

          <meta property="fc:frame:button:3" content="Read" />
          <meta property="fc:frame:button:3:action" content="link" />
          <meta property="fc:frame:button:3:target" content="${currentArticle.link}" />

          <meta property="fc:frame:button:4" content="Home" />
          <meta property="fc:frame:button:4:action" content="post" />
          <meta property="fc:frame:button:4:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}" />
        </head>
        <body>
          <h1>${currentArticle.title}</h1>
          <img src="${imageUrl}" alt="${currentArticle.title}" />
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);

    // Generate an error image
    const errorImageResponse = new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4B0082',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <p>Error: {error.message}</p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    const errorImageBuffer = await errorImageResponse.arrayBuffer();
    const errorImageBase64 = Buffer.from(errorImageBuffer).toString('base64');
    const errorImageUrl = `data:image/png;base64,${errorImageBase64}`;

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error Occurred</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${errorImageUrl}" />
          <meta property="fc:frame:button:1" content="Home" />
          <meta property="fc:frame:button:1:action" content="post" />
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}" />
        </head>
        <body>
          <h1>Error Occurred</h1>
          <img src="${errorImageUrl}" alt="Error" />
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}
