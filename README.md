# BudgetAI

A React Native showcase app demonstrating two key capabilities:

1. **Connecting to a financial institution** — uses Plaid to authenticate users and pull in real account and transaction data from their bank or credit union.
2. **Practical AI suggestions** — surfaces actionable, context-aware spending insights and budget recommendations powered by an AI backend, grounded in the user's actual financial data rather than generic advice.
3. **Custom App State** - no libraries or extra weight. Increased understanding of how React renders state vs everything else.

The goal of this project is to show how these two pieces — real financial data and AI-driven analysis — can be combined into a mobile experience that is genuinely useful rather than just technically impressive.

---

## Project Highlights ❤️

### Financial Institution Connection

-   Integrates with **Plaid Link** to let users securely connect their bank accounts.
-   Retrieves account balances and transaction history via the Plaid API.
-   Credentials and tokens are stored in encrypted secure storage — never in plain state or AsyncStorage.

### AI Suggestions 🤬

-   Transaction data is sent to an AI service that categorizes spending and identifies patterns.
-   Suggestions are surfaced contextually (e.g., after a high-spend week, after a new recurring charge is detected).
-   Responses are scoped to the user's actual data to avoid generic or irrelevant recommendations.

### Custom State Management

-   Built a lightweight state management library modeled after Zustand's API, adapted for dependency injection.
-   Allows stores and services to be injected and swapped at any layer — useful for testing, feature flags, and environment-specific implementations — without coupling components to concrete dependencies.

---

## Folder Structure 📂

The app is organized as follows:

```
src/
  components/          # UI components
    Shared/            # Reusable components (e.g., buttons, modals, tables)
    Screens/           # Screen-specific components
  hooks/               # Custom hooks
  services/            # API and business logic
  stores/              # State management
  utils/               # Utility functions
  types/               # TypeScript types
  navigation/          # Navigation stacks
  providers/           # Context providers
  tests/               # Centralized test files
```

---

## Build and Run 👮‍♀️

### Install dependencies

```sh
yarn install -immutable
```

For iOS, install CocoaPods dependencies:

```sh
bundle install
npx pod-install
```

### Start Metro

```sh
yarn start
```

### Run the app

**Android**

```sh
yarn android
```

**iOS**

```sh
yarn ios
```

### Running Tests 🍥

```sh
yarn test

# if you need reporting
yarn test:coverage
# optional viewing
open coverage/lcov-report/index.html
```

### Formatting Code 🎭

```sh
# RIP
yarn format:fix

# non-destructive
yarn format:check
```

### Backend Server 🎉

```sh
BASE_URL=https://budget-ai-backend-f2124bc32a19.herokuapp.com
```

### Auth0 Setup

1. Install dependencies and iOS pods:

```sh
yarn install
npx pod-install
```

2. Update Auth0 credentials in:

```txt
src/services/Auth0Service.ts
```

Set:

```txt
domain: YOUR_AUTH0_DOMAIN
clientId: YOUR_AUTH0_CLIENT_ID
```

3. Update Android Auth0 domain placeholder in:

```txt
android/app/build.gradle
```

Set:

```txt
manifestPlaceholders = [auth0Domain: "YOUR_AUTH0_DOMAIN"]
```

4. In the Auth0 dashboard, register callback/logout URLs:

-   iOS callback: `com.phung.budget-ai.auth0://YOUR_AUTH0_DOMAIN/ios/com.phung.budget-ai/callback`
-   iOS logout: `com.phung.budget-ai.auth0://YOUR_AUTH0_DOMAIN/ios/com.phung.budget-ai/logout`
-   Android callback: `com.budgetai://YOUR_AUTH0_DOMAIN/android/com.budgetai/callback`
-   Android logout: `com.budgetai://YOUR_AUTH0_DOMAIN/android/com.budgetai/logout`
