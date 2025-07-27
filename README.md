# Node-RED Dashboard 2 AI Translate

An AI-powered translation addon for Node-RED Dashboard 2.0 that injects an "AI Translate" button into the Dashboard 2.0 translation interface, enabling automatic translation of UI elements using OpenAI or Anthropic APIs.

## Features

- AI-powered translation using OpenAI (GPT-3.5/GPT-4) or Anthropic (Claude 3)
- Support for multiple languages
- Built-in rate limiting to avoid API throttling
- Visual progress tracking for batch translations
- Secure server-side API calls
- Browser-based API key storage (never saved in flows)

## Installation

### Method 1: Manual Installation (Recommended)

1. Navigate to your Node-RED directory:
```bash
cd ~/.node-red
```

2. Install the module:
```bash
npm install /path/to/node-red-dashboard-2-ai-translate
```

3. **Important**: Add the AI Translate Injector node to any flow in Node-RED
   - Open Node-RED editor
   - Find "ai translate injector" in the palette
   - Drag it to any flow
   - Deploy

4. Restart Node-RED

### Method 2: Using Install Script

```bash
cd node-red-dashboard-2-ai-translate
./install.sh
```

## Configuration

After installation and adding the injector node:
1. Open the Dashboard 2.0 configuration (double-click any Dashboard 2.0 node)
2. Go to the translation interface
3. The "AI Translate" button will appear before the "Refresh" button

## How It Works

The module works by:
1. Detecting when the Dashboard 2.0 ui_base configuration is opened
2. Injecting the AI Translate button into the translation interface
3. Providing the translation functionality through REST endpoints

**Note**: You must add the "AI Translate Injector" node to a flow for the auto-injection to work. This ensures the module is loaded by Node-RED.

## Usage

### Manual Translation

1. Open the Dashboard 2.0 translation interface in Node-RED
2. Click the "AI Translate" button (appears before the "Refresh" button)
3. Select source and target languages
4. Choose your AI provider (OpenAI or Anthropic)
5. Enter your API key
6. Click "Translate" to start the process

### API Endpoint

The addon exposes a REST endpoint for translation:

```bash
POST /dashboard/ai-translate/translate
Content-Type: application/json

{
    "text": "Hello World",
    "sourceLang": "en",
    "targetLang": "fr",
    "provider": "openai",
    "apiKey": "your-api-key"
}
```

Response:
```json
{
    "translatedText": "Bonjour le monde"
}
```

## API Rate Limits

- **OpenAI**: 100ms between requests
- **Anthropic**: 2 seconds between requests (to avoid rate limiting)

## Supported Languages

- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

## Security

- API keys are stored locally in the browser's localStorage
- Keys are never saved in Node-RED flows
- All API calls are made server-side to avoid CORS issues
- Optional session-based key storage

## Troubleshooting

If the button doesn't appear:
1. Make sure you've added the "AI Translate Injector" node to a flow
2. Deploy your flows
3. Restart Node-RED
4. Clear your browser cache
5. Open the Dashboard 2.0 configuration dialog (double-click any Dashboard 2.0 node)
6. Navigate to the "Translations" tab
7. Check the browser console for "[AI Translate]" log messages

### Debug Steps:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Filter by "[AI Translate]"
4. Double-click a Dashboard 2.0 node to open configuration
5. Navigate to the Translations tab
6. Look for injection logs in the console

Expected console messages:
- `[AI Translate] Module initializing...`
- `[AI Translate] ui_base type found, injecting...`
- `[AI Translate] oneditprepare called for ui_base`
- `[AI Translate] Found refresh button, injecting AI Translate button...`
- `[AI Translate] Button added successfully`

## Development

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## License

Apache-2.0

## Credits

Created for [FlowFuse Dashboard 2.0](https://dashboard.flowfuse.com)