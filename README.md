# 🤖 Claude Computer Agent

AI agent that performs computer tasks using Claude API and Telegram.

## Features

- 💬 Control via Telegram
- 📁 File operations (create, read, write, delete)
- ⚙️  Terminal command execution
- 🔍 File search
- 🧠 AI-powered decision making

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
Edit `.env` file and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
TELEGRAM_BOT_TOKEN=8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw
TELEGRAM_CHAT_ID=226166473
```

## Usage

Start the bot:
```bash
npm start
```

Send commands via Telegram:
- "Create a file called test.txt with hello world"
- "Find all PDF files on Desktop"
- "Run ls -la in Documents folder"
- "Read the contents of package.json"
- "Delete temp.txt file"

## Examples

### Create a file
```
User: Create a Python script called hello.py that prints "Hello World"
Agent: ✅ Task Completed! File written successfully: /Users/username/hello.py
```

### Run a command
```
User: List all files in Desktop directory
Agent: ✅ Task Completed!
Output: file1.txt
file2.pdf
folder1
```

### Search for files
```
User: Find all JavaScript files in my home directory
Agent: ✅ Task Completed! Found 15 files:
/Users/username/project/index.js
/Users/username/app/src/main.js
...
```

## Safety

The agent runs with user permissions. Be careful with destructive commands!

## License

MIT
