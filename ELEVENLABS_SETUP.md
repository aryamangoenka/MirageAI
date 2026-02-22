# ElevenLabs Integration Setup for MirageAI

## Features Implemented

1. **Executive Summary Audio** - Play audio version of executive summaries
2. **Conversational AI Advisor** - Ask questions about your simulation results via voice/text

---

## Step 1: Get ElevenLabs API Key

1. Go to https://elevenlabs.io/
2. Sign up for free account
3. Navigate to Profile → API Keys
4. Copy your API key

---

## Step 2: Create Conversational Agent

1. Go to https://elevenlabs.io/app/conversational-ai
2. Click "Create Agent"
3. **Agent Name**: MirageAI Advisor
4. **LLM Configuration**:
   - Select: **Gemini 2.0 Flash**
   - Paste your Gemini API key: `AIzaSyC3fVtkMF931dBRVTztme_VsPBDLkJ3YFw`
5. **Base Prompt** (paste this):
   ```
   You are a MirageAI project advisor. You help users understand software project
   simulation results including timeline predictions, risk factors, and cost
   estimates. Be concise (2-4 sentences) and actionable in your responses.
   ```
6. **Voice Settings**:
   - Choose voice: Rachel or Josh (professional voices)
   - Stability: 0.5
   - Similarity: 0.75
7. Click "Save"
8. **Copy the Agent ID** from the URL or agent settings

---

## Step 3: Configure Frontend Environment

Edit `/Users/aryamangoenka/Desktop/MirageAI/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here  # ← Paste agent ID
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here  # ← Paste API key
```

---

## Step 4: Restart Frontend

```bash
# Stop the current frontend server (Ctrl+C)
cd /Users/aryamangoenka/Desktop/MirageAI/frontend
pnpm dev
```

---

## How to Use

### Executive Summary Audio

1. Run a simulation
2. Click "AI Insights" → "Executive Summary"
3. In the "Listen to Summary" section, click **"Play Audio Summary"**
4. Audio will be generated and played automatically

### Conversational Advisor

1. Run a simulation
2. Look for the **"🎙️ Ask AI Advisor"** button (needs to be added - see below)
3. Click to open conversational interface
4. Ask questions like:
   - "Why is my integration risk so high?"
   - "How can I improve my on-time probability?"
   - "Should I add more senior developers?"

---

## Free Tier Limits

| Feature | Free Quota | Usage per Demo |
|---------|------------|----------------|
| TTS (Audio Summary) | 10,000 chars/month | ~350 chars |
| Conversational Agent | ~20 min audio/month | ~2 min |
| **Total demos** | **~10 full demos/month** | - |

---

## TODO: Add "Ask AI Advisor" Button

The conversational advisor component is ready, but needs a trigger button. Add this to a results component:

```tsx
import { useAppState } from "@/lib/app-state"
import { MessageCircle } from "lucide-react"

// Inside your component:
const { setShowAdvisor, baseline } = useAppState()

// Add button:
{baseline && (
  <button
    onClick={() => setShowAdvisor(true)}
    className="btn-primary flex items-center gap-2"
  >
    <MessageCircle className="w-4 h-4" />
    Ask AI Advisor
  </button>
)}
```

Suggested locations:
- Hero metrics component (top right)
- Below the simulation results
- In the navbar

---

## Testing

1. Run a simulation with test data
2. Click "Executive Summary"
3. Click "Play Audio Summary" (should hear voice)
4. Click "Ask AI Advisor" (should see chat interface)
5. Ask "Why is my timeline longer than expected?"
6. Should hear voice response explaining the risks

---

## Troubleshooting

### "Setup Required" error
- Check that `.env.local` has valid `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- Restart frontend after changing env vars

### "ElevenLabs API key not configured" error
- Check that `.env.local` has valid `NEXT_PUBLIC_ELEVENLABS_API_KEY`
- Restart frontend

### Audio doesn't play
- Check browser console for errors
- Verify API key is correct
- Check free tier quota hasn't been exceeded

### Agent doesn't respond
- Check agent ID is correct
- Verify Gemini API key is configured in ElevenLabs dashboard
- Check browser console for connection errors

---

## Product Name Update

All references have been updated from "PlanSight" to "MirageAI":
- ✅ Backend `.env` file
- ✅ Conversational Advisor prompts
- ✅ Component descriptions

---

## Backend Gemini API Key

Updated to: `AIzaSyC3fVtkMF931dBRVTztme_VsPBDLkJ3YFw`
Model: `gemini-2.0-flash-exp` (latest fast model)
