import { ImageResponse } from '@vercel/og';
import fetchRSS from '../../utils/fetchRSS';  // Adjust the path as needed

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const FONT_SIZE_TITLE = 60; // Font size for the title
const FONT_SIZE_DESC = 30; // Font size for the description
const PADDING = 40; // Padding around the text

export default async function handleAction(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
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

    const imageUrl = new ImageResponse(
      (
        <div
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: PADDING,
            backgroundColor: '#4B0082',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h1
            style={{
              fontSize: FONT_SIZE_TITLE,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {currentArticle.title}
          </h1>
          <p
            style={{
              fontSize: FONT_SIZE_DESC,
              textAlign: 'center',
            }}
          >
            {currentArticle.description}
          </p>
        </div>
      ),
      {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
      }
    );

    res.status(200).setHeader('Content-Type', 'text/html').send(`
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
    `);
  } catch (error) {
    console.error('Error processing request:', error);

    const errorImageUrl = new ImageResponse(
      (
        <div
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
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
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
      }
    );

    res.status(200).setHeader('Content-Type', 'text/html').send(`
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
    `);
  }
}
