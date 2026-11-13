ErgoSpace – Ergonomic Desk Accessories E-Commerce Platform

ErgoSpace is a full-stack e-commerce platform designed to help users discover and compare ergonomic desk accessories for a comfortable and productive workspace.

Live Demo

- Frontend: https://ergospace-frontend.vercel.app
- Backend API: https://ergospace-backend.onrender.com
- Product Comparison: https://ergospace-frontend.vercel.app/compare
- Admin Login: https://ergospace-frontend.vercel.app/admin/login

Features

User Features

- Browse ergonomic desk accessories.
- View product details and features.
- Search and explore products.
- Compare up to three products side by side.
- View product categories and pricing.

Admin Features

- Admin authentication and login.
- Protected admin dashboard.
- Add new products.
- Update existing products.
- Delete products.
- Upload product images using Cloudinary.

Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Node.js
- Express.js
- REST API

Database

- MongoDB Atlas
- Mongoose

Additional Tools

- Git and GitHub
- Vercel
- Render
- Cloudinary

Project Architecture

User
  |
  v
Next.js Frontend
  |
  | API Requests
  v
Node.js + Express Backend
  |
  | Database Operations
  v
MongoDB Atlas

Product Images
  |
  v
Cloudinary

Project Structure

ergospace/
│
├── app/
│   ├── admin/
│   ├── compare/
│   ├── components/
│   └── page.tsx
│
├── backend/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   ├── cloudinary.js
│   └── package.json
│
├── public/
├── package.json
└── README.md

Installation and Setup

Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Git

1. Clone the Repository

git clone https://github.com/shyamakash12212-source/ergospace.git

2. Open the Project

cd ergospace

3. Install Frontend Dependencies

npm install

4. Configure Frontend Environment

Create a ".env.local" file in the project root:

NEXT_PUBLIC_API_URL=YOUR_BACKEND_API_URL

5. Install Backend Dependencies

cd backend
npm install

6. Configure Backend Environment

Create a ".env" file inside the backend folder with your MongoDB, JWT and Cloudinary configuration.

Never commit environment files or expose credentials publicly.

7. Start the Backend

npm start

8. Start the Frontend

Open another terminal in the project root:

npm run dev

Open "http://localhost:3000" in your browser.

Deployment

- Frontend: Deployed using Vercel.
- Backend: Deployed using Render.
- Database: Hosted on MongoDB Atlas.
- Image Storage: Cloudinary.

Version Control

This project uses Git and GitHub for source code management and version control.

Project Goal

The goal of ErgoSpace is to provide a convenient platform for discovering ergonomic desk accessories and making informed product comparisons to create a better workspace.

---

ErgoSpace – Work Better. Feel Better.