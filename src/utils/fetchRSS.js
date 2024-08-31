const axios = require('axios');
const xml2js = require('xml2js');

async function fetchRSS(category) {
    const url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
    
    console.log(`Fetching RSS feed for top news from URL: ${url}`);

    try {
        const response = await axios.get(url);
        console.log('RSS feed fetched successfully for top news');

        const parsedData = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });
        console.log('RSS feed parsed successfully for top news');

        const articles = parsedData.rss.channel[0].item.map(item => ({
            title: item.title[0],
            link: item.link[0],
            description: item.description ? item.description[0] : '',
            pubDate: item.pubDate[0],
            author: item.author ? item.author[0] : '',
        }));

        console.log('Articles extracted successfully for top news');
        return { articles };
    } catch (error) {
        console.error('Error fetching or parsing RSS feed for top news', error);
        return { error: 'Failed to fetch or parse RSS feed for top news' };
    }
}

module.exports = fetchRSS;