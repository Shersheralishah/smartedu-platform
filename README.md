  
# Learnexa - A Modern Full-Stack E-Learning Platform 📚


![Logo](images/header.png)

A feature-rich, role-based learning management system (LMS) built with a powerful Java & Spring Boot backend and a dynamic React & TypeScript frontend. `Learnexa` provides a seamless and professional experience for instructors to create and manage their content, and for students to discover, purchase, and consume courses.

---

## ✨ Key Features

The platform follows a robust MVC architecture on the backend and is divided into two primary user experiences:

### 👨‍🏫 Instructor Features

- **Secure Authentication:** Full registration and login system using JWT for secure sessions.
- **Course Management Dashboard:** A dedicated dashboard to view, search, and manage all created courses.
- **Advanced Course Creation & Editing:** An intuitive, multi-step form to create and edit courses with modules and resources.
- **AI-Powered Content Generation:** Integrated with the Gemini API to automatically generate compelling course descriptions.
- **Dynamic Pricing & Discounts:** Set course prices and promotional discounts with real-time feedback.
- **Rich Resource Uploads:** Upload various resource types, including PDFs (stored locally) and Video/Article links.
- **Course Analytics:** A detailed dashboard for each course showing total enrollments, estimated revenue, and an interactive graph of enrollment trends.
- **Student Roster:** View and search a paginated list of all students enrolled in a specific course.

![Instructor Dashboard GIF](images/instructor.gif)

### 🎓 Student Features

- **Secure Authentication:** Register and log in as a student to access the platform.
- **Interactive Course Catalog:** A beautiful, responsive dashboard to discover and search all available courses.
- **"Freemium" Course Previews:** Students can view the first module of any course for free before deciding to enroll.
- **Seamless Enrollment:** A simulated checkout process for enrolling in free or paid courses.
- **Personal Learning Dashboard ("My Courses"):** A dedicated page to access all enrolled courses.
- **Professional Course Viewer:** An immersive learning interface with a collapsible curriculum sidebar, an integrated PDF viewer, and embedded video/link content.

![Student Dashboard GIF](images/student.gif)

---

## 🛠️ Built With

The project leverages a modern, scalable, and professional technology stack.

| Backend (learningpath) | Frontend (learningpath-dashboard) |
| ---------------------- | ------------------------------------- |
| Java 21                | React 18 & TypeScript                 |
| Spring Boot 3          | Vite                                  |
| Spring Security (JWT)  | Tailwind CSS                          |
| Spring Data JPA        | Recharts (for charts)                 |
| PostgreSQL             | Axios                                 |
| **Cloudinary** |                                       |


---

## 🚀 Getting Started

To get a local copy up and running, please follow these steps.

### Prerequisites

- Java JDK 21 or later
- Node.js v18 or later
- A running PostgreSQL database
- A Cloudinary account (for user profile image uploads)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd learningpath
    ```
2.  **Configure Environment Variables:**
    - In `src/main/resources/`, rename `application-example.properties` to `application.properties`.
    - Fill in your PostgreSQL database details (`spring.datasource.url`, `username`, `password`).
    - Add your Cloudinary API details (`cloudinary.cloud_name`, `api_key`, `api_secret`).
3.  **Run the application:**
    ```sh
    ./gradlew bootRun
    ```
    The backend server will start on `http://localhost:8080`. The first time it runs, the `DataSeeder` will populate the database with fake users and courses.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd learningpath-dashboard
    ```
2.  **Install Dependencies:**
    ```sh
    npm install
    ```
3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

---

## 🔮 Future Enhancements 

I am open to suggestions and plan to continue developing this platform.

---

## 🤝 Contact

Isa Shaikh - [isashaikh2005@gmail.com](mailto:isashaikh2005@gmail.com)

Project Link: [https://github.com/IsaShaikh/smartedu-platform](https://github.com/IsaShaikh/smartedu-platform)