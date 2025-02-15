import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; // Import cors
import dotenv from 'dotenv';

dotenv.config();


const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY;
app.use(express.json());


app.use(cors());


app.get('/crypto/info', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Missing required parameter: name' });
    }

    try {
        // Corrected URL for the map data
        const mapUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY=${API_KEY}`;
        const mapResponse = await fetch(mapUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!mapResponse.ok) {
            throw new Error(`Error fetching map data: ${mapResponse.statusText}`);
        }

        const mapData = await mapResponse.json();
        const crypto = mapData.data.find(crypto => crypto.name.toLowerCase() === name.toLowerCase());

        if (!crypto) {
            return res.status(404).json({ error: 'Cryptocurrency not found' });
        }

        const id = crypto.id;

        // Fetch the cryptocurrency info using the ID
        const infoUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${id}&CMC_PRO_API_KEY=${API_KEY}`;
        const infoResponse = await fetch(infoUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!infoResponse.ok) {
            throw new Error(`Error fetching info data: ${infoResponse.statusText}`);
        }

        const infoData = await infoResponse.json();

        // Fetch the cryptocurrency quotes using the ID
        const quotesUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${id}&CMC_PRO_API_KEY=${API_KEY}`;
        const quotesResponse = await fetch(quotesUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!quotesResponse.ok) {
            throw new Error(`Error fetching quotes data: ${quotesResponse.statusText}`);
        }

        const quotesData = await quotesResponse.json();

        // Combine info and quotes data
        const combinedData = {
            ...infoData.data[id],
            ...quotesData.data[id].quote.USD
        };

        res.json(combinedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});


app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
