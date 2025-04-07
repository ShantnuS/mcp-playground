import axios from 'axios';

export interface StockQuote {
  symbol: string;
  latestPrice: number;
  currency: string;
  change: number;
  changePercent: number;
  previousClose: number;
  high: number;
  low: number;
}

export async function getStockQuote(symbol: string): Promise<StockQuote | { error: string }> {
  try {
    const blueSkyToken = process.env.BLUESKY_API_KEY as string;

    const response = await axios.get(`https://api.blueskyapi.com/v1/data/core/quote/${symbol}?token=${blueSkyToken}`);
    const data = response.data?.[0]; // it's an array

    if (!data) {
      return { error: `No data returned for symbol: ${symbol}` };
    }

    const {
      latestPrice,
      currency,
      change,
      changePercent,
      previousClose,
      high,
      low
    } = data;

    return {
      symbol: symbol.toUpperCase(),
      latestPrice,
      currency,
      change,
      changePercent,
      previousClose,
      high,
      low
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
