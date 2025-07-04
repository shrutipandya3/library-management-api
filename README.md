# Library Management API

A Node.js REST API built with TypeScript, Prisma, and PostgreSQL to manage users, libraries, books, and image storage. The application uses **Neon** for PostgreSQL hosting and **Supabase** for image storage.

---

## Tech Stack

- **Node.js** + **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Hosted on Neon)
- **Supabase** (Image Storage)
- **JWT Authentication**
- **Zod Validation**
- **i18n** for Localization

---

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) and npm installed
- Access to **Neon** database
- Supabase project configured for image storage

---

## Installation and Running Locally

### 1. Clone the Repository

```bash
git clone your-repository-url.git
cd your-project-directory

### 2. Install dependencies

```bash
npm install

### 3. Generate Prisma Client

```bash
npx prisma generate

### 4. Set up environment variables
- Create a .env file in the root directory and add the following:

```bash
DATABASE_URL=your_neon_database_url_here
PORT=3000
JWT_SECRET=your_jwt_secret_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_BUCKET_NAME=your_supabase_bucket_name_here

### 5. Start the development server

```bash
npm run dev
