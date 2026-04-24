# Neroa Mobile Launch Readiness

## Product MVP included in this scaffold

- Sign in / sign up
- Plan selection entry flow
- Engine Board
- Open Engine detail
- Lane structure view
- Neroa mobile chat surface
- Support / contact screen
- Account / settings screen

## Brand assets

- Replace `assets/icon.png` with final square app icon export
- Replace `assets/adaptive-icon.png` with Android adaptive foreground asset
- Replace `assets/splash.png` with a store-ready splash composition

## Environment

- Add `EXPO_PUBLIC_SUPABASE_URL`
- Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Confirm mobile app points to the same Supabase project as web

## iOS checklist

- Confirm bundle identifier `io.naroa.app`
- Generate App Store Connect record
- Replace placeholder icon/splash exports
- Prepare TestFlight testers and onboarding notes
- Confirm privacy strings and any device permissions before enabling camera, location, or notifications
- Run full auth/session test on real iPhone hardware

## Android checklist

- Confirm package identifier `io.naroa.app`
- Generate Play Console app record
- Replace adaptive icon assets
- Prepare internal testing track
- Validate auth/session persistence on Android hardware
- Confirm notification behavior and deep-link routing before beta

## Permissions review

- Camera: only if a future engine flow requires it
- Location: only if future mobile builds need location-aware behavior
- Notifications: only when Neroa mobile notifications are wired for real
- Payments: validate app-store billing implications if subscriptions ship in-app

## Submission readiness

- Final brand assets exported at required sizes
- Production environment variables set
- Release notes drafted
- Support/contact links verified in-app
- Account deletion / privacy flow reviewed
- TestFlight build uploaded
- Google Play internal/beta build uploaded
