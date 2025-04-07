# MCP Playground

A test project demonstrating the Model Context Protocol (MCP) for building AI plugins that can be used with Microsoft Copilot Studio.

## About this Project

This repository contains a sample MCP server implementation that provides stock quote and historical data through a plugin interface. The project demonstrates:

- Setting up an MCP server using the `@modelcontextprotocol/sdk`
- Implementing tools that can be called by AI models
- Using Server-Sent Events (SSE) for communication
- Testing and debugging using the MCP Inspector tool

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- A BlueSky API key (for stock data)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mcp-playground.git
   cd mcp-playground/mcp-stock-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment:
   ```
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your BlueSky API key:
   ```
   BLUESKY_API_KEY=your_api_key_here
   ```

## Running the Server

Start the development server:
```
npm start
```

The server will be running at `http://localhost:3000`.

## Testing with MCP Inspector

1. Run the MCP Inspector tool:
   ```
   npm run inspector
   ```

2. Connect to your local server by entering the server URL `http://localhost:3000` in the MCP Inspector interface.

You should now be able to test and debug your MCP server using the inspector tool.