# Platform, Security, and Release

Use this reference for native/platform integration, permissions, auth/storage, signing, build configuration, and CI/CD.

## Platform integration

When changing Android/iOS/web/desktop configuration, inspect both Dart usage and native setup. Confirm:

- minimum OS/browser/toolchain requirements;
- manifest/plist/entitlements/capabilities;
- permission declarations and runtime request flow;
- Gradle/Xcode/CocoaPods/native dependency requirements;
- background execution restrictions;
- deep links/universal links/app links;
- notification configuration;
- architecture/ABI constraints;
- platform-specific fallback behavior.

Keep native changes minimal and explain why each is needed.

## Method channels, FFI, plugins

Use a plugin before bespoke platform code when it is mature and fits the requirement. For custom channels/FFI:

- define narrow typed contracts;
- version/handle backward compatibility when multiple app/native versions can interact;
- map native errors intentionally;
- keep thread/isolate requirements explicit;
- free native resources deterministically;
- test platform behavior on actual supported targets when feasible.

## Permissions and privacy

Request only permissions required for user-visible functionality. Prefer contextual permission requests near the action that needs them. Handle denied, permanently denied, unavailable, and restricted states gracefully.

Do not collect or retain more user data than the feature requires.

## Secrets and credentials

A Flutter client is not a secure place for server secrets. Anything bundled in a client can ultimately be extracted.

- Never commit private keys, signing passwords, service-account credentials, backend secrets, or long-lived privileged API keys.
- Use backend-mediated secrets for privileged operations.
- Use platform-secure storage for user/session credentials when appropriate, while understanding that client compromise remains possible.
- Keep environment-specific configuration separated from secrets.
- Avoid logging tokens, authorization headers, sensitive personal data, or full protected payloads.

## Authentication/session handling

- model token expiry/refresh explicitly;
- prevent parallel refresh storms;
- clear session state predictably on logout/revocation;
- handle clock/network failures;
- avoid persisting more credentials than necessary;
- treat authorization as a server responsibility, not a client-only guard.

## Web-specific concerns

Consider URL/deep-link behavior, browser back/forward navigation, refresh persistence, CORS (server-controlled), caching/service workers, accessibility, responsive layout, browser storage exposure, and download/bundle performance.

Do not put secret values in web build-time defines expecting them to remain secret.

## CI/CD

A robust pipeline should run the repository's required subset of:

- dependency resolution;
- formatting check;
- static analysis/lints;
- unit/widget tests;
- code generation consistency;
- integration tests where feasible;
- platform build verification;
- artifact/signing/release steps with secrets stored in the CI secret manager.

Cache dependencies carefully; never cache or print sensitive signing material unintentionally.

## Release readiness

Before production release when in scope, verify:

- version/build number policy;
- environment/API endpoints;
- signing/provisioning;
- crash reporting/observability configuration;
- permissions/privacy descriptions;
- release-mode behavior;
- obfuscation/symbol upload requirements if used;
- store-specific configuration and platform metadata owned by the repository/process;
- rollback or staged rollout strategy when available.
