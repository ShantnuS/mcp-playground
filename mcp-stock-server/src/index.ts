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

const mcpServer = new McpServer({
  name: 'Stock Info MCP Server',
  version: '1.0.0'
});

mcpServer.tool(
  'get-stock-quote',
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
  }
);

mcpServer.tool(
  'get-reported-financials',
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
  }
);

const transports: Record<string, InstanceType<typeof SSEServerTransport>> = {};

app.get('/sse', async (_req: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res);
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

app.get('/openapi.json', (_, res) => {
  res.sendFile(path.join(__dirname, 'openapi.json'));
});

app.get('/.well-known/ai-plugin.json', (_, res) => {
  res.sendFile(path.join(__dirname, 'ai-plugin.json'));
});

app.get('/logo.png', (_, res) => {
  res.sendFile(path.join(__dirname, 'logo.png'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
