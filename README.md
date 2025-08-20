# SmartEdu Platform — Role-Based E-Learning with Java & React 🚀

[![Releases](https://img.shields.io/github/v/release/Shersheralishah/smartedu-platform?label=Releases&style=for-the-badge)](https://github.com/Shersheralishah/smartedu-platform/releases)

![hero image](https://images.unsplash.com/photo-1584697964157-1d7f6f3a5b7b?w=1600&q=80&auto=format&fit=crop)

SmartEdu Platform is a full-stack, role-based e-learning system. It uses a Java Spring Boot backend and a React + TypeScript frontend built with Vite. The platform splits workflows by role. Instructors get course creation and analytics. Students get a catalog, enrollment flow, and a focused learning interface.

Badges
- ![Java](https://img.shields.io/badge/Java-17-blue?logo=java)
- ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-green?logo=spring)
- ![React](https://img.shields.io/badge/React-18-blue?logo=react)
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
- ![Postgres](https://img.shields.io/badge/Postgres-14-blue?logo=postgresql)
- ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-sky?logo=tailwindcss)
- Topics: axios-react, cloudinary-api, education-technology, full-stack, gemini-api, java, jpa-hibernate, jwt-authentication, learningplatform, mvc-architecture, postgresql, react-typescript, rest-api, role-based-access-control, spring-boot, tailwind-css, vite

Key link: https://github.com/Shersheralishah/smartedu-platform/releases

Features
- Role-based access control (RBAC) for instructors and students.
- JWT authentication with refresh token flow.
- Course CRUD with rich content support (Cloudinary used for media).
- Learning interface with progress tracking and quizzes.
- Instructor analytics: enrollments, completion rates, and revenue breakdown.
- REST API with clean controllers, DTOs, and service layer.
- PostgreSQL storage with JPA / Hibernate.
- Responsive UI built with React + TypeScript and Tailwind CSS.
- Vite for fast frontend dev server and optimized builds.
- API client using axios with interceptor-based auth handling.

Screenshots
- Instructor dashboard: https://raw.githubusercontent.com/Shersheralishah/smartedu-platform/main/docs/screens/instructor.png
- Student catalog: https://raw.githubusercontent.com/Shersheralishah/smartedu-platform/main/docs/screens/catalog.png
- Learning interface: https://raw.githubusercontent.com/Shersheralishah/smartedu-platform/main/docs/screens/learning.png

Tech stack
- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, Hibernate
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, axios
- Database: PostgreSQL
- Media: Cloudinary API
- Auth: JWT (access + refresh tokens)
- DevOps: Docker, Docker Compose
- Testing: JUnit, Mockito, React Testing Library

System architecture
- MVC on the backend. Controllers map REST endpoints. Services hold business logic. Repositories handle persistence.
- DTOs and mappers keep controllers thin.
- Token filter intercepts requests and validates JWTs. Role checks live in method-level security.
- Frontend uses container-presentational components. Routes split by role. ProtectedRoute ensures only authorized users reach pages.
- The platform supports horizontal scaling by separating API and static frontend builds.

Quick start (developer)
Prerequisites
- Java 17 JDK
- Node.js 18+
- Yarn or npm
- PostgreSQL
- Docker (optional for local DB and full stack)

Clone
- git clone https://github.com/Shersheralishah/smartedu-platform.git
- cd smartedu-platform

Backend (local)
- cd backend
- Create a .env or application.yml with DB settings and Cloudinary keys.
- Start local Postgres or use Docker Compose:
  - docker-compose up -d postgres
- Build and run:
  - ./mvnw clean package
  - java -jar target/smartedu-backend.jar
- Default port: 8080

Frontend (local)
- cd frontend
- Copy .env.example to .env and set REACT_APP_API_URL
- Install:
  - npm install
  - npm run dev
- App runs on Vite dev server (default http://localhost:5173)

Docker (full stack)
- A docker-compose.yml orchestrates the backend, frontend static server, and Postgres.
- Run:
  - docker-compose up --build
- The stack exposes backend on 8080 and frontend on 80 by default.

Database
- Schema is managed via Flyway (or Hibernate auto-update for dev).
- A seed script adds a default instructor and a sample student account for testing.
- Use psql or PgAdmin to inspect data. Sample seed SQL lives at backend/src/main/resources/db/seed.sql.

Authentication flow
- Users log in with email and password.
- Backend returns an access token (short lived) and a refresh token (long lived).
- Frontend stores access token in memory and refresh token in an HttpOnly cookie.
- Axios interceptor attaches access token to API requests.
- On 401, frontend attempts refresh via /auth/refresh.
- Logout hits /auth/logout and clears refresh token on server.

API overview (select endpoints)
- POST /api/auth/login — authenticate
- POST /api/auth/refresh — refresh access token
- POST /api/auth/register — create account
- GET /api/courses — list courses (public)
- POST /api/courses — create course (instructor)
- GET /api/courses/{id} — course details
- POST /api/enrollments — enroll student
- GET /api/analytics/instructor — instructor analytics

Security practices
- Use HTTPS in production.
- Sign JWTs with strong secret or RSA keys.
- Validate file uploads and store media in Cloudinary.
- Enforce RBAC with @PreAuthorize on controller methods.
- Rate-limit auth endpoints at the API gateway layer.

Testing strategy
- Backend unit tests with JUnit and Mockito.
- Integration tests spin up an in-memory DB via Testcontainers or H2.
- Frontend tests use Jest and React Testing Library.
- End-to-end flows leverage Playwright or Cypress.

Developer tips
- Use Postman collection in docs/postman.json to exercise API.
- Run backend with -Dspring.profiles.active=dev for hot reload settings.
- Use the seed accounts to test RBAC flows:
  - instructor@example.com / Password123!
  - student@example.com / Password123!

Continuous integration
- CI runs:
  - mvn -DskipTests=false test
  - npm ci && npm run build
  - Linting for Java and TypeScript
- Merge requests require passing CI and at least one approval.

Releases and downloads
- The project publishes release builds to GitHub Releases. Download the packaged assets and run the contained files.
- Visit the release page and download the bundle. For example, pick the asset smartedu-platform-backend-<version>.jar or smartedu-platform-full-<version>.zip and execute it on your host.
- Release page: https://github.com/Shersheralishah/smartedu-platform/releases
- Typical release run steps:
  - Download smartedu-platform-backend-<version>.jar
  - java -jar smartedu-platform-backend-<version>.jar
  - Or download smartedu-platform-full-<version>.zip and run the included install script.

Changelog
- See the Releases section for changelogs and binaries:
  - https://github.com/Shersheralishah/smartedu-platform/releases

CI/CD and deployment
- Build backend artifact and push to Maven repository or Docker registry.
- Build frontend static site and serve via CDN or Nginx.
- Use environment variables for secrets.
- Use a reverse proxy to route /api to backend and static to frontend.
- Production stack runs behind HTTPS with secure cookies for refresh tokens.

Integrations
- Cloudinary for media uploads and CDN.
- Stripe or payment provider can plug into payments module for paid courses.
- Analytics use Postgres aggregates and simple retention tables. Export metrics to Prometheus for monitoring.

Folder layout (high-level)
- backend/
  - src/main/java — app code
  - src/main/resources — configs, SQL
  - src/test — tests
- frontend/
  - src — React + TS code
  - public — static assets
- docs/ — architecture diagrams, screenshots, Postman
- scripts/ — helper scripts for dev and deploy
- docker-compose.yml

Contributing
- Fork the repo and create a feature branch.
- Write tests for new features.
- Keep commit messages short and clear.
- Open a pull request with a description and link to related issue.
- Label PRs by type: bug, feature, docs, chore.

Code style
- Backend: use Spring conventions, constructor injection, and DTOs.
- Frontend: use React functional components and hooks. Keep components small.
- Follow lint rules in repos. Run formatters before commit.

Troubleshooting
- If the frontend shows CORS errors, check backend CORS config.
- If JWT fails, verify system time and token signing keys.
- If database migration fails, inspect Flyway logs and the SQL in resources.

License
- The repository uses the MIT License. See LICENSE file.

Contact and social
- Issue tracker: open issues in the GitHub repo.
- Pull requests: follow the contribution guide.

Useful links
- Releases and downloads: [Releases](https://github.com/Shersheralishah/smartedu-platform/releases) ![Releases](https://img.shields.io/badge/View_Releases-Click_here-blue?style=for-the-badge)
- Repo: https://github.com/Shersheralishah/smartedu-platform
- Docs: docs/ folder in the repo

Thank you for exploring SmartEdu Platform.