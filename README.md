# GlowCare - Personal Skincare Management Platform

GlowCare is a comprehensive, production-ready full-stack web application designed to help users track skincare products, design and monitor morning/night routines, keep a skin journal, and view analytics of their skincare consistency.

## Technical Stack

### Frontend
- **React.js & TypeScript**: Main structure and component model.
- **Vite**: Rapid hot reloading compilation.
- **Tailwind CSS v4**: Beautiful glassmorphic design and custom themes.
- **React Router DOM**: Secure route management.
- **Recharts**: Advanced data plotting of routines, water logs, and mood splits.
- **Framer Motion**: Smooth entry, exit, and list reordering micro-animations.
- **React Hook Form**: Form inputs validation.

### Backend
- **Node.js & Express**: Rest API layer.
- **MongoDB & Mongoose**: Database mapping and relationship schemas.
- **JWT & bcryptjs**: Safe password hashing and session generation.
- **Multer**: local file system file uploads.

---

## Getting Started

### Prerequisites
- Node.js installed locally.
- MongoDB running locally at `mongodb://localhost:27017` or a MongoDB Atlas URI connection.

### Installation

1. Clone the repository and install dependencies for both services:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. Seed the database with categories, ingredients, compatibility rules, and a default admin:
```bash
cd ../backend
npm run seed
```
This generates:
- **Default Admin Account**:
  - Email: `admin@glowcare.com`
  - Password: `admin123456`

3. Run both servers:
```bash
# Start backend api
cd backend
npm run dev

# Start frontend dev server
cd ../frontend
npm run dev
```

---

## Application Collections

- **Users**: Authentication profile documents.
- **Products**: User owned inventory records.
- **Routines**: Morning and Night step list structures.
- **RoutineHistory**: Tracking daily checklist status percentages.
- **JournalEntries**: Mood, sleep, water, and skin worries.
- **Photos**: Daily skin snaps.
- **Wishlist**: Shopping logs to buy next.
- **Achievements**: Gamified milestone badges.
- **Categories**: Product organization tags.
- **Ingredients**: Basic chemical compounds registry.
- **CompatibilityRules**: Chemical interaction constraints.
