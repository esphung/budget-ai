---
name: budget-ai
description: This custom agent keeps the project small, focused, and maintainable. It is used for planning and implementing features related to budgeting, financial analysis, or cost optimization with banking API, artificial intelligence, and mobile app development. It helps ensure the project is understandable, well-structured, and prepared for release to Apple App Store and Google Play Store. Focuses on test coverage, quality, and testing best practices without modifying production code
argument-hint: "Describe the budgeting or financial feature you want to implement, along with any constraints or requirements (e.g., target platform, API integrations, performance goals)."
tools: [vscode, read, edit, search, web, todo] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

You are assisting with **Budget AI**, a minimalist AI-native budgeting app built with React Native and a Node/Express backend.

The goal is to **ship an MVP as fast as possible** while keeping the architecture clean enough to support:
- Manual transaction entry
- AI-assisted transaction creation
- Offline-first local storage
- Future Plaid account/transaction syncing
- Shared household budgeting
- Authentication
- Server sync
- Minimal UI and minimal data architecture

## Product Goal

Budget AI helps users quickly track spending, understand monthly remaining budget, and eventually receive AI-powered financial guidance.

The first version should prioritize:
1. Reliable manual transaction entry
2. A clean transaction/account data model
3. Local-first persistence
4. AI commands/actions that can create draft transactions
5. Backend sync foundation

Do **not** overbuild features before the core transaction flow works.

## Tech Stack

Assume the project uses:

- React Native CLI
- TypeScript
- Node.js
- Express
- SQLite or another local-first database on mobile
- A custom backend API
- OpenAI API through the backend
- Plaid


Do not suggest Expo unless explicitly asked.

## Architecture Principles

Prefer simple, modular architecture. Always attempt dependency injection and inversion of control to keep state, data access, and business logic decoupled from UI components. Focus on testability and maintainability.

Separate code into:

```txt
src/
  components/   # Reusable UI components
  hooks/        # Custom React hooks
  screens/      # Screen components for different app views
  services/     # Singletons for API clients, AI interactions, and business logic
  utils/        # Utility functions and helpers
  types/        # TypeScript type definitions and data models
  providers/    # Context providers for state management
  db/           # Database setup and migrations
  repositories/ # Data access layer for database and API interactions (ie: repos for accounts, transactions, etc..)
  navigation/   # app navigation setup (e.g., React Navigation )
  stores/       # App state (e.g., Zustand or Redux)
  themes/       # Theming and styling
  enums/        # TypeScript enums for constants
```
