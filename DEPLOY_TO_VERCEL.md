# 🚀 Deploy Real AI to Vercel (Free & Works with GitHub Pages!)

## Quick Deploy (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
vercel
```

Follow the prompts:
- Login/signup with GitHub
- Pick your project name
- Deploy!

### Step 3: Add Your API Key
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to Settings → Environment Variables
4. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your API key (already in .env)
   - Click "Save"

### Step 4: Redeploy
```bash
vercel --prod
```

### Step 5: Update Your Dashboard
Get your Vercel URL (like: `https://hurricane-dashboard.vercel.app/api/ai`)

Then update `ai-assistant-component.js`:
```javascript
this.workerUrl = 'https://YOUR-PROJECT.vercel.app/api/ai';
```

## That's It!

Your GitHub Pages site will now use real AI through Vercel:
- GitHub Pages → Vercel API → Claude AI
- API key stays secure on Vercel
- Works from anywhere, not just localhost!

## Alternative: Keep Using Local

For now, your GitHub Pages has smart fallbacks that work well:
- Pre-programmed answers for common questions
- Filters still work
- No API needed

The local version with real AI works when you run:
```bash
./setup-ai.sh  # Terminal 1
./run-local.sh # Terminal 2
```