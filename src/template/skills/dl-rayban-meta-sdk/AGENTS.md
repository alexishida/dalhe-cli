# Ray-Ban Meta / Meta Wearables Development

When working on Meta AI glasses, use the bundled plugin skills in `plugins/rayban-meta-sdk/skills/` as the local source of workflow guidance.

Core rules:

1. Identify the target first: Ray-Ban Meta Gen 1/2, Meta Ray-Ban Display, Oakley Meta, or unknown.
2. For non-display Ray-Ban Meta, prefer a mobile app using Meta Wearables Device Access Toolkit (DAT).
3. Only use Web Apps when the target is Meta Ray-Ban Display or the user explicitly targets display glasses.
4. Before writing SDK-specific code, verify current APIs/versions using the official Wearables MCP (`https://mcp.developer.meta.com/wearables`) when available. Use `search_dat_docs` for DAT and `search_webapps_docs` for Web Apps.
5. If live docs are unavailable, state that the bundled knowledge is a 2026-09-22 snapshot. Do not invent classes, packages, permissions, capabilities, release policies, or device support.
6. Prefer adapting the user's existing app/architecture over scaffolding a new project unless asked.
7. Include registration, permission, lifecycle, cleanup, and failure-state handling in production-oriented code.
8. Keep camera frames off the main/UI thread where practical; avoid unnecessary copies and unbounded queues.
9. Treat camera/microphone data as sensitive. Minimize retention and explain cloud transfer when adding AI/vision services.
10. Developer Preview limitations and publishing rules can change; verify them before promising distribution.
