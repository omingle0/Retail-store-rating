🛒 Retail Store Rating System

A full-stack web application that allows users to rate retail stores while enabling administrators and store owners to manage and monitor performance using role-based access control.

This project is designed to demonstrate real-world full-stack architecture, secure authentication, and multi-role authorization.

🛠️ Setup Instructions
1️⃣ Clone the repository
git clone <your-repo-url>
cd retail-store-rating

2️⃣ Install backend dependencies
cd backend
npm install

3️⃣ Install frontend dependencies
cd frontend
npm install

4️⃣ Setup Database

Create a MySQL database and update .db:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=retail_rating
JWT_SECRET=your_secret_key

5️⃣ Run Backend
cd backend
npm start

6️⃣ Run Frontend
cd frontend
npm run dev
