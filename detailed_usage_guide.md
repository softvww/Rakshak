# 📘 Detailed Usage Guide for **Rakshak** (रक्षक) App

> This guide explains how to **install**, **configure**, and **use** the Rakshak safety companion app on Android devices. It is written for a professional audience and includes visual references (screenshots) generated from the UI mockups.

---

## 1️⃣ Install the App

1. **Download the APK**
   - Obtain `RakshakApp.apk` from the provided download link or from the Google Play Store (once published).
2. **Enable Installation from Unknown Sources**
   - Settings → Security → *Install unknown apps* → Choose the file manager or browser you used → **Allow**.
3. **Install**
   - Open the APK file on your device and follow the on‑screen prompts.

> **Tip:** You may also install via ADB for bulk testing:
> ```bash
> adb install "C:/Users/Akash Misal/Desktop/RakshakApp/RakshakApp.apk"
> ```

---

## 2️⃣ First Launch & On‑boarding

When you open the app for the first time, you are presented with a brief onboarding carousel that explains the core features.

![Home Screen](file:///C:/Users/Akash%20Misal/.gemini/antigravity/brain/9c58313b-337e-4abb-919f-4dbe2fa2e127/rakshak_home_mockup_1779766504412.png)

- **Home** – Dashboard showing quick‑access buttons.
- **Safety Tips** – Short safety quiz (see *Quiz Card* below).

---

## 3️⃣ Core Features

### 3.1 SOS Emergency Button

The red **SOS** button is always reachable from the home screen. Pressing it does the following:
1. Sends an SMS with your live location to pre‑configured emergency contacts.
2. Triggers an automated phone call to the nearest police station (if enabled).
3. Shows a *SOS Confirmation* screen.

![SOS Screen](file:///C:/Users/Akash%20Misal/.gemini/antigravity/brain/9c58313b-337e-4abb-919f-4dbe2fa2e127/rakshak_sos_screen_1779767921310.png)

### 3.2 Share Live Location

From the **Location Share** tile you can share a real‑time map view with trusted contacts for a configurable duration (5‑30 minutes).

![Location Share](file:///C:/Users/Akash%20Misal/.gemini/antigravity/brain/9c58313b-337e-4abb-919f-4dbe2fa2e127/rakshak_location_share_1779767688372.png)

### 3.3 Police Contact Card

Tap the **Police Card** to view emergency numbers, a one‑tap dial button, and a small map of the nearest police station.

![Police Card](file:///C:/Users/Akash%20Misal/.gemini/antigravity/brain/9c58313b-337e-4abb-919f-4dbe2fa2e127/rakshak_police_card_1779767644003.png)

### 3.4 Safety Quiz

A short, interactive quiz reinforces personal safety habits. Correct answers unlock **badge** rewards.

![Quiz Card](file:///C:/Users/Akash%20Misal/.gemini/antigravity/brain/9c58313b-337e-4abb-919f-4dbe2fa2e127/rakshak_quiz_card_1779767955552.png)

---

## 4️⃣ Managing Subscriptions

The app offers three subscription tiers (monthly, quarterly, yearly). Access **Settings → Subscription** to view or change your plan.

| Plan | Price (₹) | Features |
|------|-----------|----------|
| **Monthly** | 800 | Full feature set, auto‑renew each month |
| **Quarterly** | 1 700 | 2 months free (≈15 % discount) |
| **Yearly** | 4 000 | 30 %+ discount, priority support |

Payments are processed through Google Play Billing; you can cancel anytime from the Play Store subscription page.

---

## 5️⃣ Privacy & Data Handling

- **Location data** is stored only while a share session is active and is deleted automatically afterward.
- **Contact details** are encrypted on‑device; no server‑side storage occurs for personal contacts.
- A full **Privacy Policy** is available in‑app via *Settings → Privacy* and on the Play Store listing.

---

## 6️⃣ Support & Feedback

- In‑app **Help** screen provides a contact form that forwards logs to our support mailbox.
- For urgent issues, call **+91‑XXXXXXXXXX** (available 24 × 7).

---

## 7️⃣ Quick Reference Summary

| Action | How to Do It |
|--------|--------------|
| **Launch SOS** | Tap the red SOS button → Confirm → Message sent automatically |
| **Share Location** | Home → *Location Share* → Set duration → Tap *Start* |
| **View Police Card** | Home → *Police Card* → Tap *Call* |
| **Take Safety Quiz** | Home → *Safety Quiz* → Answer → Earn badge |
| **Change Subscription** | Settings → *Subscription* → Choose plan |

---

### 📎 Attachments
- Full UI mockup archive: `UI_Mockups.zip` (contains all PNGs listed above). *(You can generate this zip from the artifact directory if needed.)*

---

**End of guide**
