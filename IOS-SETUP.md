# PepTalk – iOS Setup

To build and run PepTalk on iPhone/iPad you need **a Mac with Xcode**. iOS apps cannot be built on Windows.

---

## 1. Requirements

- **macOS** (Apple Silicon or Intel)
- **Xcode** (from the Mac App Store) – latest stable version
- **Xcode Command Line Tools** (Xcode → Settings → Locations → Command Line Tools)
- **Node.js** (v18+; LTS recommended)

---

## 2. Install dependencies

On your Mac, in the project folder:

```bash
npm install
```

---

## 3. Add the iOS platform (first time only)

```bash
npx cap add ios
```

This creates the `ios/` folder and wires the app to Capacitor.

If you see **CocoaPods** or **pod install** errors:

- Open the `ios/` folder in Xcode once, then run: `cd ios && pod install`
- Or use: `npx cap add ios --packagemanager SPM` (Swift Package Manager) if you prefer not to use CocoaPods.

---

## 4. Build the web app and sync to iOS

Whenever you change the React/Vite app:

```bash
npm run build:ios
```

Or step by step:

```bash
npm run build
npx cap sync ios
```

---

## 5. Open in Xcode and run

```bash
npx cap open ios
```

Then in Xcode:

1. Select a **simulator** (e.g. iPhone 15) or a **connected device** in the toolbar.
2. Click **Run** (▶) or press `Cmd + R`.

---

## 6. Run on a real iPhone/iPad

1. Connect the device with USB.
2. In Xcode, choose your device from the run destination menu.
3. First time: **Signing & Capabilities** → set your **Team** (Apple ID). Xcode may create a free provisioning profile.
4. On the device: **Settings → General → VPN & Device Management** → trust your developer certificate if prompted.
5. Run the app from Xcode (▶).

---

## 7. Notifications (optional)

The app uses **Local Notifications**. On iOS:

- When the app asks for notification permission, tap **Allow**.
- If you changed notification behavior in code, run `npm run build:ios` and then run again from Xcode.

---

## 8. If you develop on Windows

- You **cannot** run `npx cap add ios` or build the iOS app on Windows.
- Options:
  1. Use a **Mac** (your own or a cloud Mac) and follow the steps above.
  2. Use **GitHub Actions** (or similar) with a **macOS runner** to build the iOS app and/or archive for TestFlight/App Store.
  3. Use a **Codemagic**, **Bitrise**, or **App Center**-style service that builds iOS from your repo.

---

## Quick reference

| Task              | Command              |
|-------------------|----------------------|
| Add iOS (once)    | `npx cap add ios`    |
| Build + sync      | `npm run build:ios`  |
| Open in Xcode     | `npx cap open ios`   |

After opening in Xcode, use the Run button to launch on simulator or device.
