# Neroa Mobile App

This folder contains the React Native + Expo mobile app path for Neroa itself.

## MVP scope

- Sign in / sign up
- Plan-selection entry flow
- Engine Board
- Open an Engine
- View lane structure
- Naroa chat / guidance view
- Support / contact access
- Account / settings

## Stack

- React Native + Expo
- Supabase auth + session persistence
- React Navigation for mobile-native navigation

## Setup

1. Copy `.env.example` to `.env`.
2. Add the live Supabase URL and anon key.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

## Notes

- iOS bundle identifier: `io.naroa.app`
- Android package: `io.naroa.app`
- Launch-readiness checklist lives in [docs/launch-readiness.md](./docs/launch-readiness.md)
- App icon and splash files are scaffolded from the current public brand asset and should be replaced with store-ready exports before submission.
