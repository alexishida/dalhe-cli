# Ray-Ban Meta Gen 1 compatibility

Checked 2026-09-22 against Meta's Wearables FAQ. Recheck live documentation
before implementation because DAT is a Developer Preview and device support can
change.

Ray-Ban Meta Gen 1 is in the documented device list for the Meta Wearables
Device Access Toolkit. The supported application model is a paired iOS or
Android app, not an app installed on the glasses.

## Supported direction

- Camera access is the initially documented toolkit capability for Gen 1.
- Photo capture and video/stream work must use the currently documented DAT
  capability and device/session lifecycle.
- Microphone and speaker access use iOS or Android Bluetooth profiles; verify
  the current audio route, permission, interruption, and concurrent-stream
  constraints before coding.
- Mock Device Kit can exercise supported simulated device, permission, and
  media states, but physical-device validation remains necessary.

## Not supported by the Gen 1 hardware path

- On-glasses visual display UI.
- Standalone Wearables Web Apps, which are for Meta Ray-Ban Display glasses.
- Direct installation of a third-party app on the glasses OS.

## Preconditions and limits

- Enable Developer Mode on the glasses through the Meta AI mobile app.
- Pair the compatible glasses with the phone through the Meta AI app.
- Confirm the developer and user are in a country supported for full toolkit
  capabilities and the Wearables Developer Center.
- Check current iOS/Android, Meta AI app, firmware, SDK, registration, and
  publishing requirements. Developer Preview availability does not guarantee
  public distribution.

## Official sources

- https://developers.meta.com/wearables/faq/
- https://developers.meta.com/wearables/
- https://wearables.developer.meta.com/docs/develop/
