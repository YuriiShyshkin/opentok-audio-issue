# Audio Issue Sample

This sample application shows the audio issue that happens on mobile devices.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/YuriiShyshkin/opentok-audio-issue?file=js/app.js)

## Preconditions:

Enter your credentials in `config.js`.

## Steps to reproduce:

1. Generate a token for the Host.
2. Launch the app from the desktop Chrome browser, enter the generated token and click the "Submit Token" button.
3. On the confirmation modal click the "Yes" button.
4. Generate a token for the Participant.
5. Launch the app from mobile Safari (iPhone), enter the generated token and click the "Submit Token" button.
6. On the confirmation modal click the "Yes" button.
7. As the Host from the desktop Chrome browser click the "Enable Audio" button.

Actual Result: The Participant from iPhone Safari does not hear the Host.

Expected Result: The Participant from iPhone Safari should always hear the Host.

Note:
If one more participant joins the session the Participant from iPhone Safari starts hearing the Host.
If both users join from desktop browsers they will hear each other.
