# AI Assistant Setup Guide

This guide explains how to set up the AI Assistant feature with the Cloudflare Worker.

## Overview

The Hurricane Dashboard includes an AI Assistant that can answer questions about hurricane data and automatically apply filters based on user queries. The AI functionality is powered by a Cloudflare Worker that processes requests using OpenAI's API (or Cloudflare AI as an alternative).

## Setup Steps

### 1. Deploy the Cloudflare Worker

1. **Create a Cloudflare account** at [https://cloudflare.com](https://cloudflare.com)

2. **Navigate to Workers & Pages** in your Cloudflare dashboard

3. **Create a new Worker**
   - Click "Create application"
   - Select "Create Worker"
   - Give it a name (e.g., "hurricane-ai-assistant")

4. **Copy the worker code**
   - Open `cloudflare-worker.js` from this repository
   - Copy the entire contents

5. **Paste the code into the Worker editor**
   - Replace the default code with the copied code
   - Click "Save and Deploy"

6. **Set up environment variables**
   - Go to your Worker's Settings → Variables
   - Add an environment variable:
     - Variable name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (get one from [https://platform.openai.com](https://platform.openai.com))
   - Click "Save"

7. **Copy your Worker URL**
   - It will look like: `https://hurricane-ai-assistant.YOUR-SUBDOMAIN.workers.dev`

### 2. Update the Application Code

1. **Open** `js/timeline-app.js` in your code editor

2. **Find the line** (around line 801):
   ```javascript
   workerUrl: 'YOUR_CLOUDFLARE_WORKER_URL', // Replace with your actual worker URL
   ```

3. **Replace** `YOUR_CLOUDFLARE_WORKER_URL` with your actual Worker URL:
   ```javascript
   workerUrl: 'https://hurricane-ai-assistant.YOUR-SUBDOMAIN.workers.dev',
   ```

4. **Save the file**

### 3. Alternative: Use Cloudflare AI (Free Tier)

If you don't have an OpenAI API key, you can use Cloudflare's built-in AI models:

1. **Modify the worker code** in `cloudflare-worker.js`:
   - Comment out lines 30-66 (the OpenAI API call)
   - Uncomment the Cloudflare AI example (lines 122-128)
   - Adjust the code to use the AI response format

2. **No API key needed** - Cloudflare AI is included in the Workers free tier

## Features

Once set up, the AI Assistant can:

- Answer questions about specific hurricanes
- Suggest and automatically apply filters
- Provide historical context and statistics
- Guide users through the data exploration

## Fallback Mode

If the Cloudflare Worker is not set up or fails, the assistant will automatically fall back to hardcoded responses. This ensures the feature remains functional even without the API connection.

## Testing

1. Deploy your changes to GitHub Pages
2. Open the Hurricane Dashboard
3. Click the AI Assistant button (chat icon)
4. Try questions like:
   - "Show me all Category 5 hurricanes"
   - "What hurricanes hit Florida in 2004?"
   - "Tell me about Hurricane Andrew"

## Troubleshooting

- **CORS errors**: The worker includes CORS headers, but ensure your domain is allowed
- **API failures**: Check the browser console for error messages
- **No responses**: Verify your API key is correctly set in Cloudflare
- **Rate limits**: OpenAI has rate limits; consider implementing caching in the worker

## Security Notes

- Never commit your API keys to the repository
- The Cloudflare Worker keeps your API key secure on the server side
- Consider adding rate limiting to prevent abuse