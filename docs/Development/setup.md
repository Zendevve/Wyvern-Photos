# Development Setup

How to set up and run Wyvern Photos locally.

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS, macOS only)

## Quick Start

```bash
# Clone and install
cd wyvern-photos
npm install

# Start Expo dev server
npm start

# Run on Android (opens in emulator or device)
npm run android

# Run on web (limited features)
npm run web
```

## Development Build

For full feature support (secure storage, background tasks), you need a development build:

```bash
# Generate native projects
npx expo prebuild

# Build and run on Android
npx expo run:android

# Build and run on iOS (macOS only)
npx expo run:ios
```

## Project Structure

```
wyvern-photos/
├── app/              # Expo Router screens
│   └── (tabs)/       # Tab navigation screens
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/
│   ├── database/     # SQLite database layer
│   ├── telegram/     # Telegram Bot API client
│   └── storage.ts    # Secure credential storage
├── constants/        # App-wide constants
└── docs/             # Documentation
```

## Telegram Bot Setup

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow the prompts
3. Save the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Create a private channel for storage
5. Add the bot as admin to the channel
6. Get channel ID (forward a message to `@raw_data_bot`)

## Database

Using `expo-sqlite` with the following tables:
- `photos` - Local device photos
- `remote_photos` - Photos in Telegram
- `folders` - Folder management
- `bots` - Multiple bot support
- `settings` - App configuration
- `upload_queue` - Background upload queue

Database is initialized automatically on first launch.

## Environment

No `.env` file needed. Sensitive data (bot tokens) stored in:
- `expo-secure-store` on device
- Never committed to version control
