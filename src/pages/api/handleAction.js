import axios from 'axios';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'nodejs', // Use nodejs runtime to avoid edge runtime issues
};

async function fetchArticles() {
  const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';

  try {
    const response = await axios.get(url);
    const xml2js = require('xml2js');
    const parsedData = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });

    const articles = parsedData.rss.channel[0].item.map(item => ({
      title: item.title[0],
      link: item.link[0],
      description: item.description ? item.description[0] : '',
      pubDate: item.pubDate[0],
      author: item.author ? item.author[0] : '',
    }));

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    throw new Error('Failed to fetch articles');
  }
}

export default async function handler(req, res) {
  console.log('Received request to handleAction handler');
  console.log('Request method:', req.method);

  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    let currentIndex = 0;
    if (req.query.index) {
      currentIndex = parseInt(req.query.index, 10);
    }

    const articles = await fetchArticles();
    currentIndex = (currentIndex + articles.length) % articles.length;

    const currentArticle = articles[currentIndex];
    const nextIndex = (currentIndex + 1) % articles.length;
    const prevIndex = (currentIndex - 1 + articles.length) % articles.length;

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
    const pngBase64 = Buffer.from(imageBuffer).toString('base64');

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="data:image/png;base64,${pngBase64}" />

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
          <img src="data:image/png;base64,${pngBase64}" alt="${currentArticle.title}" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error.message);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="data:image/png;base64,${DEFAULT_PLACEHOLDER_IMAGE}" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/handleAction" />
        </head>
        <body>
          <p>Error occurred. Please try again later.</p>
        </body>
      </html>
    `);
  }
}
