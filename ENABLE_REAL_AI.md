# 🤖 How to Enable REAL AI (30 seconds)

## Current State: Smart Fallbacks
Right now, the AI Assistant uses **pre-written responses** for common questions. It's not using real AI yet.

## To Enable Real Claude AI:

### Step 1: Open the File
Open `ai-assistant-component.js` in any text editor

### Step 2: Add Your API Key
Find line 7:
```javascript
this.anthropicApiKey = ''; // ADD YOUR KEY HERE: sk-ant-api-...
```

Replace with:
```javascript
this.anthropicApiKey = 'sk-ant-api-03-xxxxx'; // Your actual key
```

### Step 3: Save & Test
1. Save the file
2. Commit and push to GitHub
3. Open your dashboard
4. Ask any hurricane question!

## What Happens:

### Without API Key (Current):
- Uses pattern matching
- Returns pre-written answers for common questions
- Still applies filters correctly
- Limited to ~10 programmed responses

### With API Key (After Adding):
- **Real AI responses** from Claude
- Can answer ANY hurricane question
- Understands context and nuance
- Can discuss patterns, comparisons, predictions
- Still applies filters automatically

## Example Questions That Need Real AI:
- "How does 2024 compare to 2005 for Florida?"
- "What's the relationship between El Niño and hurricane activity?"
- "Which hurricanes caused the most evacuations?"
- "Explain rapid intensification"

## Privacy Note:
- Your API key will be visible in the browser code
- Only use for personal projects
- For public sites, use Netlify/Vercel functions instead

## Cost:
- Claude Haiku: ~$0.001 per question (1000 questions = $1)
- Your free API credits will last thousands of questions

That's it! Just add your key on line 7 and you have real AI!