import axios from 'axios';

export interface ReportedFinancials {
  symbol: string;
  companyName: string;
  fiscalDate: string;
  reportDate: string;
  totalRevenue: number;
  netIncome: number;
  epsBasic: number;
  epsDiluted: number;
  grossProfit: number;
  operatingIncome: number;
  ebitda?: number;
  cashAndCashEquivalents: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  reportLink?: string;
}

export async function getReportedFinancials(symbol: string): Promise<ReportedFinancials | { error: string }> {
  try {
    const blueSkyToken = process.env.BLUESKY_API_KEY as string;
    const response = await axios.get(`https://api.blueskyapi.com/v1/data/core/reported_financials/${symbol}?token=${blueSkyToken}`);
    const data = response.data?.[0]; // it's an array

    if (!data) {
      return { error: `No reported financials found for symbol: ${symbol}` };
    }

    return {
      symbol: symbol.toUpperCase(),
      companyName: data.entityName || 'Unknown',
      fiscalDate: data.fiscalDate || data.periodEnd,
      reportDate: data.reportDate || data.date,
      totalRevenue: data.RevenueFromContractWithCustomerExcludingAssessedTax,
      netIncome: data.NetIncomeLoss,
      epsBasic: data.EarningsPerShareBasic,
      epsDiluted: data.EarningsPerShareDiluted,
      grossProfit: data.GrossProfit,
      operatingIncome: data.OperatingIncomeLoss,
      ebitda: data.ebitda,
      cashAndCashEquivalents: data.CashAndCashEquivalentsAtCarryingValue,
      totalAssets: data.Assets,
      totalLiabilities: data.Liabilities,
      shareholdersEquity: data.StockholdersEquity,
      reportLink: data.reportLink
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
