# 🧑‍💻 Peerza — Skill Exchange Platform

> 🚀 A modern full-stack platform to **teach, learn, and connect with peers** around the world.

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![Django](https://img.shields.io/badge/Backend-Django-green?logo=django)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)
![Firebase](https://img.shields.io/badge/Realtime-Firebase-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Status](https://img.shields.io/badge/Project%20Status-Completed-success)

---

## 🌍 Overview

**Peerza** is a full-stack **skill-exchange web application** built with **React + Django REST Framework**, integrating **Stripe Checkout**, **Firebase Realtime Chat**, and **JWT Authentication**.

It empowers users to **share their knowledge**, **book meetings**, **chat in real time**, and **upgrade to Pro 👑** for unlimited access.

---

## 🧩 Features

| 🚀 Category               | 💡 Description                                     |
| ------------------------- | -------------------------------------------------- |
| 🔐 **Authentication**     | JWT-based Login / Register / Refresh Token         |
| 🧑‍🎓 **Skills System**      | Add, delete, and search skills to teach or learn   |
| 💬 **Realtime Chat**      | Firebase-powered community chat with live presence |
| 🧑‍🤝‍🧑 **Friends System**     | Send, accept, and manage friend requests           |
| 🗓️ **Meeting Scheduler**  | Book sessions via weekly availability slots        |
| 🔔 **Notifications**      | Instant alerts for meetings & friend requests      |
| 💳 **Stripe Checkout**    | Upgrade to Pro via Stripe integration              |
| 🖼️ **Profile Management** | Edit bio, avatar, and show Pro badge               |
| ⚡ **Responsive Design**  | Clean, modern Tailwind UI                          |

---

## 🏗️ Tech Stack

**Frontend:**  
React (Vite) • TailwindCSS • Axios • React Router

**Backend:**  
Django • Django REST Framework • JWT • CORS Headers

**Integrations:**  
Stripe API • Firebase Realtime Database • dotenv

**Database:**  
SQLite (development) — easily switchable to PostgreSQL

---

## ⚙️ Architecture
```bash
peerza_project/
│
├── peerza_backend/
│ ├── peerza_backend/
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ │
│ ├── users/
│ │ ├── models.py # User, Skills, Meetings, Friends, etc.
│ │ ├── serializers.py
│ │ ├── views.py # Core logic
│ │ ├── views_meeting.py # Meeting & scheduling logic
│ │ ├── views_availability.py # Weekly slots management
│ │ ├── views_payments.py # Stripe Checkout endpoint
│ │ └── urls.py
│ │
│ └── .env # Stripe keys & FRONTEND_URL
│
└── peerza_frontend/
├── src/
│ ├── api.js # Axios setup + JWT refresh interceptor
│ ├── firebaseConfig.js # Firebase chat + presence setup
│ ├── components/ # Layout, ChatWidget, Scheduler, etc.
│ ├── pages/ # Dashboard, Settings, GetPro, etc.
│ └── App.jsx # Routing + Protected pages
│
└── vite.config.js
```
---

## 💳 Stripe Pro Flow

1️⃣ User clicks **“Get Pro 👑”** in the navbar.  
2️⃣ Frontend calls → `/api/payments/create-session/`.  
3️⃣ Django backend creates a Stripe Checkout Session using the Stripe SDK.  
4️⃣ Stripe redirects to the secure hosted payment page.  
5️⃣ On success, Stripe redirects user → `/payment-success`.  
6️⃣ Frontend updates user profile (`is_pro=True`) via `/api/profile/`.

---

## 🔥 Firebase Realtime Chat

- 🔑 Anonymous authentication (no login required on Firebase)
- 🌐 Presence tracking (`/presence/{uid}`) for online/offline status
- 💬 Global chat room (`/community_chat`)
- ⚡ Live updates via `onValue()` listener
- 🎨 Auto-scroll and message bubble UI

---

## 🧠 Key Django Models

| Model                          | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| **User**                       | Custom model with bio, avatar, is_pro, firebase_uid |
| **Skill / UserSkill**          | Users can teach or learn specific skills            |
| **Meeting / Availability**     | Schedule sessions with time slots                   |
| **Notification**               | Alerts for friend requests & meetings               |
| **FriendRequest / Friendship** | Peer connection management                          |
| **Message**                    | Chat message history                                |

---

## 🧾 API Highlights

| Endpoint                        | Method              | Description                  |
| ------------------------------- | ------------------- | ---------------------------- |
| `/api/register/`                | POST                | Register a new user          |
| `/api/login/`                   | POST                | Obtain JWT tokens            |
| `/api/profile/`                 | GET / PATCH         | Fetch or update current user |
| `/api/my-skills/`               | GET / POST          | Manage user skills           |
| `/api/search/?skill=`           | GET                 | Search for peers by skill    |
| `/api/availability/`            | GET / POST / DELETE | Manage weekly time slots     |
| `/api/meetings/`                | GET / POST          | Create or view meetings      |
| `/api/friends/`                 | GET                 | List friends                 |
| `/api/notifications/`           | GET                 | Fetch user notifications     |
| `/api/payments/create-session/` | POST                | Stripe Checkout session      |

---

## ⚡ Installation Guide

### 🧱 Backend Setup

```bash
cd peerza_backend
python -m venv venv
venv\Scripts\activate   # (on Windows)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Create .env file inside peerza_backend/:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173


Frontend Setup
cd peerza_frontend
npm install
npm run dev

🌐 Then open the app at:
👉 http://localhost:5173

⭐ If you like this project, don’t forget to star the repo!
It helps me stay motivated and grow as a developer 🙌
```

## 🧾 License

This project is licensed under the MIT License.
You’re free to use, modify, and distribute this project with attribution.

## 👨‍💻 Author

Developed by: Umer Fayyaz

🎓 BS-Information Technology | 5th Semester
💡 Passionate about Full-Stack Development (React + Django)
🌟 “Code. Learn. Teach. Repeat.”
