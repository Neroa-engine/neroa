# Neroa Live View

Internal unpacked Chrome extension for inspecting local, preview, and production runtime targets during Neroa build sessions.

## Load it

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the folder:
   - `C:\Users\Administrator\Documents\GitHub\neroa\extensions\neroa-live-view`

## Connect it

1. Open a Neroa workspace project Live View page, for example:
   - `/workspace/<workspaceId>/project/<projectId>/live-view`
2. Open the extension side panel.
3. The extension will bind itself to the active workspace/session automatically.
4. Switch to the current runtime target tab you want Neroa to inspect.

## What it does

- inspects live DOM state
- reads visible UI text
- logs buttons, forms, links, sections, and modals
- captures runtime and network failures
- tracks walkthrough progress
- supports optional recording with timestamped history
- pushes findings back into the active Neroa workspace session

## Current scope

This is a local developer extension and inspection bridge. It is not yet packaged for Chrome Web Store distribution.
