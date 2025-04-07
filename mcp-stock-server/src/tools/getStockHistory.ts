import axios from 'axios';

export interface HistoricalDataPoint {
  date: string;
  close: number;
}

export interface StockHistory {
  symbol: string;
  dataPoints: HistoricalDataPoint[];
}

export async function getStockHistory(symbol: string, range: string): Promise<StockHistory | { error: string }> {
  try {
    const response = await axios.get(`https://api.blueskyapi.com/history/${symbol}`, {
      params: { range },
      headers: {
        'x-api-key': process.env.BLUESKY_API_KEY as string
      }
    });

    const dataPoints = response.data.map((entry: any) => ({
      date: entry.date,
      close: entry.close
    }));

    return { symbol, dataPoints };
  } catch (error: any) {
    return { error: error.message };
  }
}
