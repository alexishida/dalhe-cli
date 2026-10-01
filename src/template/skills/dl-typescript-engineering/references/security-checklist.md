# TypeScript Security Checklist

Use only the sections relevant to the code being reviewed.

## Access control

- Authentication established before protected actions.
- Authorization checked for action + specific resource/tenant/owner.
- No trust in client-provided roles, owner IDs, prices, permissions, or workflow state.
- Multi-tenant queries scoped by tenant at the data-access boundary.
- Administrative functions protected independently of UI visibility.

## Injection and execution

- SQL/NoSQL queries parameterized or safely constructed by the ORM.
- No shell command concatenation from untrusted data.
- No `eval`, `new Function`, unsafe dynamic import paths, or code generation from untrusted values.
- Templates escape by default; raw/unescaped rendering is narrowly justified.
- Logs do not permit dangerous control-data confusion when ingested by downstream systems.

## Web security

- HTML/Markdown rendering handles XSS risk.
- Redirect destinations are allowlisted or constrained.
- URL fetching defends against SSRF: scheme/host restrictions, redirect revalidation, and private/internal target controls where relevant.
- CORS is explicit and not reflection-based with credentials.
- CSRF protection is appropriate for cookie-authenticated state-changing requests.
- Cookies use suitable `HttpOnly`, `Secure`, and `SameSite` settings.
- Security-sensitive responses use appropriate cache behavior.

## Files and paths

- User-controlled paths cannot escape an intended base directory.
- Uploads enforce size and relevant type/content checks.
- Filenames are not trusted for storage paths or response headers without sanitization/encoding.
- Archive extraction blocks traversal and dangerous link behavior.
- Temporary files use safe creation APIs and lifecycle cleanup.

## Secrets and crypto

- Secrets come from approved secret/config mechanisms, not source or client bundles.
- Logs/errors do not reveal secrets.
- Passwords use a modern password-hashing scheme through a vetted library.
- Tokens have appropriate entropy, expiry, audience/scope semantics, and verification.
- Cryptographic comparisons use constant-time primitives when relevant.
- Do not invent encryption, signatures, token formats, or password schemes.

## Object safety

- Avoid merging attacker-controlled keys into prototypes or configuration objects.
- Consider dangerous keys such as `__proto__`, `prototype`, and `constructor` for deep merge/path utilities.
- Do not deserialize arbitrary executable objects.

## Resource abuse

- Bound payload sizes, pagination, loops, recursion, regex work, decompression, concurrency, and queue fan-out.
- Regexes operating on attacker-controlled long strings avoid catastrophic backtracking.
- Expensive endpoints have rate limiting or equivalent abuse controls when appropriate.
- External calls have timeouts and bounded retries.

## Dependencies and supply chain

- Lockfile is present and consistent.
- Avoid unnecessary packages, especially for trivial functionality.
- Review direct dependency advisories and whether vulnerable code paths are reachable.
- Treat install/postinstall scripts and newly introduced transitive packages as trust decisions.
- Do not apply broad automatic upgrade/fix commands without reviewing changed versions and behavior.

## Finding severity guidance

Describe severity from concrete impact + exploitability rather than labels alone. Include preconditions and affected boundary. Avoid calling a theoretical issue critical without a credible exploitation path.
