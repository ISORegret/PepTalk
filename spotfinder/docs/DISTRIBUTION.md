# Making SpotFinder Accessible to Others

Ways to get SpotFinder onto other people’s devices, from easiest to full public release.

---

## 1. **Expo Go (easiest – dev/testing only)**

**Good for:** Showing friends or testers without building an installable app.

**How:**
- You run `npx expo start` in the project.
- Others install **Expo Go** from the App Store (iOS) or Google Play (Android).
- They scan the QR code from your terminal (or the Expo dev tools in the browser) and the app loads in Expo Go.

**Limitations:**
- They need Expo Go installed and a way to reach your dev server (same Wi‑Fi or tunnel).
- Not suitable as a “real” app you publish; it’s for development and quick demos.
- Some native modules (e.g. certain map or image-picker behavior) may differ from a production build.

**Tunnel (so they don’t need your Wi‑Fi):**
```bash
npx expo start --tunnel
```
They scan the tunnel URL’s QR code and connect over the internet.

---

## 2. **EAS Build + internal/beta installs (recommended next step)**

**Good for:** Letting testers install a real .ipa (iOS) or .apk/.aab (Android) without going through the stores.

**What you need:**
- **Expo account** (free): https://expo.dev/signup  
- **EAS CLI**: `npm install -g eas-cli` then `eas login`  
- **EAS Build** (free tier has a limited number of builds per month)

**One-time setup:**

1. In the **SpotFinder** project root:
   ```bash
   cd spotfinder
   npx eas-cli init
   ```
   This creates `eas.json` and links the project to your Expo account.

2. Build for testers:
   - **Android (APK – easiest for testers):**
     ```bash
     eas build --platform android --profile preview
     ```
     In `eas.json` add a `preview` profile that builds an APK (so testers can install without the Play Store). Example:
     ```json
     {
       "build": {
         "preview": {
           "android": {
             "buildType": "apk"
           }
         },
         "production": {}
       }
     }
     ```
     EAS will give you a **download link** for the APK. Share that link; anyone with an Android device can download and install (they may need to allow “Install from unknown sources”).
   - **iOS:**  
     Testers need the app via **TestFlight** (see below) or you need to add their device UDIDs for an ad-hoc build. EAS can build an iOS app; distribution is either TestFlight (Apple Developer account required) or ad-hoc (limited to registered devices).

**Summary:**  
- **Android:** EAS Build → APK → share link. No store account needed for testers.  
- **iOS:** EAS Build → then TestFlight (needs Apple Developer) or ad-hoc (needs device registration).

---

## 3. **Google Play Store (Android – public)**

**Good for:** Anyone with an Android device can find and install SpotFinder.

**What you need:**
- **Google Play Developer account**: https://play.google.com/console — **one-time $25**.
- **EAS Build** (or local build) producing an **Android App Bundle (.aab)** (recommended) or APK.

**Steps (high level):**
1. Create a Play Console account and pay the $25.
2. Create an app (e.g. “SpotFinder – Photo & Car Spots”), set store listing (description, screenshots, icon, privacy policy if required).
3. Build a production Android app:
   ```bash
   eas build --platform android --profile production
   ```
   Use a `production` profile in `eas.json` (default is usually AAB).
4. In Play Console: upload the .aab (or APK), set content rating and target audience, then submit for review. After approval, the app is live.

**Optional:** Use **EAS Submit** to upload the build from the command line:
```bash
eas submit --platform android --latest
```

---

## 4. **Apple App Store (iOS – public)**

**Good for:** Anyone with an iPhone/iPad can find and install SpotFinder.

**What you need:**
- **Apple Developer Program**: https://developer.apple.com — **$99/year**.
- **EAS Build** (or Xcode) producing an **.ipa** for App Store Connect.

**Steps (high level):**
1. Enroll in Apple Developer Program and create an App ID for SpotFinder (e.g. bundle ID `com.yourname.spotfinder`).
2. In **app.json** (or app.config.js), set `expo.ios.bundleIdentifier` to that bundle ID.
3. Build for production:
   ```bash
   eas build --platform ios --profile production
   ```
   First time: EAS will prompt for Apple credentials and can create/use distribution certificates and provisioning profiles.
4. Submit to App Store Connect (via EAS Submit or manually):
   ```bash
   eas submit --platform ios --latest
   ```
5. In App Store Connect: add store listing (name, description, screenshots, privacy policy if required), set pricing (e.g. free), submit for review. After approval, the app is live.

---

## 5. **Web (optional – no app store)**

**Good for:** Sharing a link; works on any device with a browser. No install.

Expo can build for web. SpotFinder uses native modules (e.g. `react-native-maps`, `expo-image-picker`, `expo-location`), which either don’t run on web or need web-specific fallbacks. So:

- **Full feature parity on web** would require conditional code or separate web UI for map/picker/location (e.g. web map library, file input, browser geolocation).
- **Quick “brochure” web version** (e.g. list of spots, no map/picker) is possible with `expo export:web` and hosting (Vercel, Netlify, GitHub Pages, etc.).

If you want “share a link” with minimal changes, a simple web export of a read-only list is the fastest; full app experience on web is a larger task.

---

## Summary table

| Method              | Who can use it        | Cost              | Best for                    |
|---------------------|------------------------|--------------------|-----------------------------|
| **Expo Go + tunnel**| Anyone with Expo Go   | Free               | Demos, quick testing        |
| **EAS Build APK**   | Anyone with Android   | Free (EAS tier)    | Android testers, side-load  |
| **EAS Build + TestFlight** | iOS testers (invite) | $99/yr (Apple)   | iOS beta testers            |
| **Google Play**     | Public (Android)      | $25 one-time       | Public Android release      |
| **Apple App Store** | Public (iOS)           | $99/year           | Public iOS release          |
| **Web**             | Anyone with browser   | Free (hosting)     | Link sharing (limited app)  |

---

## Suggested path for SpotFinder

1. **Now:** Use **Expo Go + tunnel** to show it to others quickly.
2. **Next:** Set up **EAS Build**, create a **preview** profile that outputs an **Android APK**, and share the APK link with testers (no store account needed for them).
3. **When ready for public Android:** Create a **Google Play** developer account, build with a **production** profile, and submit the app.
4. **When ready for public iOS:** Enroll in **Apple Developer Program**, set `ios.bundleIdentifier`, build for iOS with EAS, submit via **EAS Submit** to App Store Connect, then complete the listing and submit for review.

If you tell me your target (e.g. “Android testers only” or “both stores”), I can suggest an exact `eas.json` and the next commands to run.
