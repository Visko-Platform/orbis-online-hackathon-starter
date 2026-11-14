# Implementation Plan: Voice Prompting for Orbis

Enable voice-to-text prompting for Orbis from both a paired iPhone (remote) and the Mac (local).

## Objective
- Use the iPhone as a remote microphone for Orbis.
- Provide a "Hold to Speak" interaction on the iPhone.
- Update the Orbis prompt on the Mac in real-time.
- Support optional "Auto-Steer" to immediately apply the prompt to a running Orbis session.
- Provide a fallback microphone button on the Mac for local voice input.

## Key Files & Context
- `components/camera/phone.tsx`: iPhone guest UI.
- `lib/camera/pair.ts`: WebRTC host/guest pairing logic.
- `components/orbis-demo.tsx` & `components/orbis-controls.tsx`: Mac Orbis UI.
- `hooks/use-orbis-session.ts`: Orbis session state management.
- `app/api/looks/transcribe/route.ts`: Audio transcription API.
- `lib/looks/requests.ts`: Client-side API wrappers.

## Proposed Solution

### 1. Refactor Transcription & Prompt Utilities
- Add `transcribeAudio(audio: Blob): Promise<string>` to `lib/looks/requests.ts`.
- Ensure it handles errors gracefully.

### 2. Extend WebRTC Pairing
- Modify `openHost` in `lib/camera/pair.ts` to support an optional `onPrompt` callback.
- Extend the `DataChannel` message protocol to handle `action: "prompt", text: string, autoApply?: boolean`.
- Update `Phone` in `components/camera/phone.tsx` to send these messages.

### 3. iPhone Remote UI (`components/camera/phone.tsx`)
- Detect if the pairing context is "Orbis" (can be a query param or just a default if no video is received).
- Add a "Hold to Speak" button that:
  - Uses `MediaRecorder` to capture audio.
  - Shows recording status.
  - Transcribes audio on release.
  - Sends the transcript to the Mac via WebRTC.
- Add an "Auto-Steer" toggle.

### 4. Mac Orbis Integration
- In `OrbisDemo`, add an "iPhone Remote" pairing section (similar to Camera Studio).
- When a prompt is received from the iPhone:
  - If "Auto-Steer" is enabled and a run is active:
    - If an image is selected, call `groundMotion` to polish the prompt.
    - Call `session.steerWithPrompt(polishedPrompt)`.
  - Else:
    - Update `session.setPrompt`.
- Add a local microphone button to `OrbisControls` (using `LiveVoice` or simple transcription).

## Implementation Steps

### Phase 1: Shared Logic & API
1.  **Refactor `lib/looks/requests.ts`:** Add `transcribeAudio`.
2.  **Update `lib/camera/pair.ts`:**
    - Update `openHost` signature to include `onPrompt?: (text: string, autoApply: boolean) => void`.
    - Update `channel.onmessage` to handle the `prompt` action.

### Phase 2: iPhone Remote UI
1.  **Update `components/camera/phone.tsx`:**
    - Implement `MediaRecorder` logic for "Hold to Speak".
    - Add UI for the microphone button and status.
    - Add "Auto-Steer" toggle state.
    - Send the `prompt` action via `channel.send`.

### Phase 3: Mac Orbis UI
1.  **Update `hooks/use-orbis-session.ts`:** Ensure `steerWithPrompt` is robust.
2.  **Update `components/orbis-controls.tsx`:**
    - Add a local voice button.
    - Add an "iPhone Remote" pairing section.
3.  **Update `components/orbis-demo.tsx`:**
    - Integrate `openHost` with the Orbis session.
    - Handle incoming prompts from the iPhone.

## Verification & Testing
- **Local Voice:** Test the microphone button on the Mac updates the prompt field.
- **iPhone Pairing:** Verify a pairing link can be generated from the Orbis demo.
- **Remote Voice:** Verify "Hold to Speak" on iPhone transcribes and sends text to Mac.
- **Auto-Steer:** Verify prompt is automatically applied when the toggle is on.
- **Grounding:** Verify short prompts (e.g., "blue background") are polished by Gemini before being applied (if an image is selected).

## Note on Hardware Buttons
Hardware volume buttons are not accessible in mobile browsers. The implementation will focus on a high-visibility, high-contrast on-screen button as requested for the display.
