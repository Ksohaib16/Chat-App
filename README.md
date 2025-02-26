# Full-Stack Chat Application

Real-time chat application built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

-   Frontend: React + Vite
-   Backend: Node.js + Express + Prisma
-   Database: PostgreSQL
-   Infrastructure: Docker

## Quick Start

### Prerequisites

-   Docker
-   Docker Compose

### Running the Application

1. Clone the repository:

```bash
git clone https://github.com/Ksohaib16/Chat-App.git>
cd <project-folder>
```

2. Create environment file:

```bash
DATABASE_URL="postgresql://postgres:password@db:5432/postgres"
```

3. Start services:

```bash
docker-compose up --build
```

4. Access the application:

-   Frontend: http://localhost:5173
-   Backend: http://localhost:3000

## Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## API Endpoints

-   Auth:
    -   `POST /v1/auth/otp` - Request OTP for signup
    -   `POST /v1/auth/login` - User login
-   Chat:
    -   `GET /v1/user/conversations` - Fetch user conversations
