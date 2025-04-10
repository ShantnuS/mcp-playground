import express, { Request, Response } from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport, type SSEServerTransport as SSEServerTransportType } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { getStockQuote } from './tools/getStockQuote';
import { getReportedFinancials } from './tools/getReportedFinancials';

dotenv.config();

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if (req.path === '/messages') return next(); // skip JSON body parsing
  express.json()(req, res, next); // apply to others
});

app.use(express.static(path.join(process.cwd(), 'public'), {
  dotfiles: 'allow'
}));

const mcpServer = new McpServer({
  name: 'Stock Info MCP Server',
  version: '1.0.0'
});

mcpServer.tool(
  'get-stock-quote',
  'Returns the current stock quote for a given stock ticker symbol.',
  { symbol: z.string() },
  async ({ symbol }: {symbol: string}) => {
    const result = await getStockQuote(symbol);
    if ('error' in result) throw new Error(result.error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  },
);

mcpServer.tool(
  'get-reported-financials',
  'Fetches the latest reported financials for a given stock ticker symbol.',
  { symbol: z.string() },
  async ({ symbol }: {symbol: string}) => {
    const result = await getReportedFinancials(symbol);
    if ('error' in result) throw new Error(result.error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  },
);

const transports: Record<string, InstanceType<typeof SSEServerTransport>> = {};

app.get('/sse', async (req: Request, res: Response) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host;
  const fullBaseUrl = `${protocol}://${host}/messages`;

  const transport = new SSEServerTransport(fullBaseUrl, res);
  transports[transport.sessionId] = transport;

  res.on('close', () => {
    delete transports[transport.sessionId];
  });

  await mcpServer.connect(transport);
});

app.post('/messages', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
