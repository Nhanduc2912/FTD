# Project Context: FTD (Future Trust Documents / Free-trial & Tracking Dashboard)

## Role

Act as a Senior Full-Stack TypeScript Developer specializing in React, Node.js, and Vercel deployments.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Framer Motion, Axios, React Router.
- **Backend:** Node.js, Express.js, TypeScript, Mongoose, node-cron, multer, nodemailer.
- **Database:** MongoDB (Localhost initially, Atlas for production).

## Architecture & Hardware Optimization

- Development is currently happening locally. The machine has a generous 22GB of RAM but a somewhat constrained CPU (Ryzen 5 3500U). Optimize local watch modes, builds, and TypeScript compilation to favor memory usage over intensive CPU multithreading.
- Backend and Frontend run concurrently.
- API-First approach: Always define Mongoose Schemas, Interfaces, and API endpoints before implementing Frontend UI.

## Core Features to Implement

1. **Receipt Management:** Upload, OCR (future), and track expiry dates for physical receipts (solving the fading thermal paper issue).
2. **Subscription Guillotine:** Track digital free trials/subscriptions and trigger automated email alerts 24h-72h before the auto-renewal date.
3. **Cron Jobs:** Backend relies heavily on `node-cron` for daily checks.

## Coding Guidelines (Crucial)

1. **Agent Skills Acknowledgment:** You MUST strictly adhere to the guidelines provided in the `.agents/skills` directory, specifically `vercel-react-best-practices`, `web-design-guidelines`, and `deploy-to-vercel`.
2. **TypeScript:** Use strict typing. Create shared interfaces for models (e.g., `IReceipt`, `ISubscription`) used by both frontend and backend.
3. **UI/UX:** Build clean, modern, accessible UI components. Use Tailwind for styling and Framer Motion for micro-interactions (like the "guillotine/slash" animation for canceling subscriptions).
4. **Error Handling:** Implement robust error catching in async/await functions and return structured JSON responses from the Express API.

## Current State

The boilerplate for both `/frontend` (Vite) and `/backend` (Express) has been initialized.
Awaiting instructions to build the Database Schemas.
