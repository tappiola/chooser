# Chooser Monorepo

A multi-theme chooser app built with React and Vite. The repository uses **PNPM** workspaces and **Turborepo** to manage multiple apps and a shared hook.

## Tech Stack

- [React 19](https://react.dev/) and [Vite](https://vitejs.dev/) for fast development
- [Turborepo](https://turbo.build/) for orchestrating tasks across packages
- [PNPM](https://pnpm.io/) workspaces
- ESLint and Prettier for linting and formatting

## Features

- Multi-touch selection handled by a custom `useTouches` hook
- Two apps:
  - **plain-chooser** – colored circles expand to reveal the winner
  - **pokemon-chooser** – Jigglypuff themed interface
- Touch positions constrained to the viewport to keep circles on-screen
- Both apps are PWAs with service workers for offline use

## Code Structure

```
apps/
  plain-chooser/     # basic visual chooser
  pokemon-chooser/   # Pokémon themed chooser
packages/
  use-touches/       # shared React hook
```

## Development

Install dependencies and start the apps:

```bash
pnpm install
pnpm dev
```

Run a specific package:

```bash
pnpm --filter plain-chooser dev
pnpm --filter pokemon-chooser dev
```

## Deployment

Both versions are deployed to Firebase:
- Plain chooser - https://chooser.tappiola.co.uk
- Pokemon chooser - https://pokemon-chooser.co.uk

