# SafeSphere: Next-Generation Community Safety & Disaster Resilience Mesh

> **SANKALP SETU – College Level Student AI Hackathon 2026**  
> **Goa College of Engineering (GEC), Farmagudi, Ponda**  
> **Track 7: Safety, Disaster Management & Community Resilience**  
> *Seva Sankalp Abhiyaan – Engage • Empower • Innovate • Implement*

---

## 👥 Team SafeSphere (Goa College of Engineering)

- **Gangavarapu Kaarthikeya** (`Kaarthikeya12`) – Fullstack Architecture & Auth Systems
- **Raksham Dessai** (`RakshamDessai`) – Emergency Mesh, GIS Engine, Voice Distress & Audio Synthesis
- **Prathamesh Naik** – Community Resilience, Triage Models & Data Verification

---

## 💡 The Problem

In medical crises, street harassment, and localized disasters across Goa (e.g., student campuses at Farmagudi, isolated transit corridors, or coastal rip currents), the **critical response gap** is the first **3 to 7 minutes** before official police (112) or ambulances (108) reach the scene. Traditional emergency apps suffer from:
1. Passive panic buttons with no immediate localized intervention.
2. Inability to discreetly trigger alerts without alerting attackers.
3. Absence of trusted bystander mobilization and rapid first-aid protocols.

---

## 🚀 The Solution: SafeSphere Mesh

SafeSphere transforms every smartphone into an active node in a hyper-local safety network. Combining real-time GIS mapping, on-device AI voice recognition, procedural audio deterrence, and decentralized community volunteer dispatching:

### 🌟 Key Capabilities

1. **Zero-Friction GIS Safety Map**:
   - Leaflet/OSM vector map centered on **GEC Farmagudi Campus** with verified emergency zones (Hostel security, Ponda Sub-District Hospital, 112 PCR Outpost).
   - **Click-to-Pin** anywhere in Goa with 1-click presets for rapid deployment (GEC, Panaji, Calangute, Margao).
   - Dark/Light dynamic GIS tile rendering with zero geocoding latency.

2. **Hands-Free AI Voice Distress Detector**:
   - Web Speech continuous microphone recognition for localized distress phrases (*"Bachao"*, *"Help me"*, *"Emergency"*, *"Save me"*).
   - Hands-free background listener triggers immediate SOS beacon without physical phone interaction.

3. **100dB Procedural Audio Alarm Synthesizer**:
   - High-gain Web Audio API oscillator synthesis generating 800Hz / 1200Hz dual-tone sirens.
   - Works fully offline without preloaded audio files.

4. **Anti-Harassment Fake Call Shield**:
   - Lifelike phone call simulator with custom caller presets (*Dad*, *Police PCR Unit 4*, *Roommate*).
   - Interactive dialog script with realistic ringing and text-to-speech voice playback to safely deter aggressors.

5. **First Responder Mesh (Guardian Triage)**:
   - Dedicated responder view for campus security, student volunteers, and EMTs.
   - Real-time incident geofencing, "Accept & Rush to Scene", and "Mark Safely Resolved".
   - Step-by-step emergency field protocols for CPR, Harassment Bystander Intervention (5Ds), Severe Trauma Bleeding, and Coastal Rip Current Rescue.

6. **Tactical Incident Command Center**:
   - Real-time GIS incident queue with automated AI Threat Scoring (0–100%).
   - One-click **"Simulate Distress (Judge Demo)"** button to showcase live emergency dispatch to evaluators.
   - Real-time cross-tab synchronization via HTML5 `BroadcastChannel`.

7. **Accurate Top-Right Dark / Light Mode**:
   - Modern theme tokens with clean placement in the top-right header for both light and dark environments.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Components, React 19)
- **Styling**: Tailwind CSS v4 with dynamic CSS theme variables
- **Mapping**: Leaflet & React-Leaflet with CartoDB Positron / Dark Matter tiles
- **Authentication**: Better Auth with email and session management
- **Audio & Speech**: Web Audio API (procedural oscillator sound engine) & Web Speech API
- **State & Mesh**: Real-time `BroadcastChannel` synchronization & reactive storage
- **Icons**: Lucide React

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Kaarthikeya12/SafeSphere.git
cd SafeSphere/safesphere

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with SafeSphere.

### Production Build
```bash
npm run build
npm run start
```

---

## 🏆 Hackathon Alignment (Sankalp Setu 2026)

- **Engage**: Connects students, security personnel, and local Goan communities.
- **Empower**: Puts hands-free defense tools and first-aid protocols in every citizen's pocket.
- **Innovate**: Leverages procedural audio synthesis, on-device AI voice triage, and decentralized mesh synchronization.
- **Implement**: Fully functioning, responsive, production-ready web application tested on GEC Farmagudi coordinates.

---

*Developed with ❤️ for Sankalp Setu 2026 by Team SafeSphere, Goa College of Engineering.*
