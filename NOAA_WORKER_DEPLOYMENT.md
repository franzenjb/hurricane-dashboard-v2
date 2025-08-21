# NOAA Cloudflare Worker Deployment Guide

## Step 1: Deploy the Worker

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com/
   - Navigate to Workers & Pages

2. **Create New Worker**
   - Click "Create application"
   - Select "Create Worker"
   - Name it: `noaa-hurricane-proxy` (or your preferred name)

3. **Copy the Code**
   - Click "Quick edit"
   - Delete the default code
   - Copy ALL the code from `cloudflare-noaa-worker.js`
   - Paste it into the editor

4. **Save and Deploy**
   - Click "Save and Deploy"
   - Note your worker URL (e.g., `https://noaa-hurricane-proxy.your-account.workers.dev`)

## Step 2: Test the Worker

Test each endpoint in your browser:

```
https://your-worker-url.workers.dev/?endpoint=storms
https://your-worker-url.workers.dev/?endpoint=outlook
https://your-worker-url.workers.dev/?endpoint=gtwo
https://your-worker-url.workers.dev/?endpoint=discussion
```

You should see:
- `storms`: JSON data with active storms
- `outlook`: XML RSS feed
- `gtwo`: XML graphical outlook data
- `discussion`: XML weather discussion

## Step 3: Update Your Dashboard

After deploying, update the worker URL in the next step!