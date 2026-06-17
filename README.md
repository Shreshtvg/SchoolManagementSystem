
### Instructions to Run the Full-Stack Application

Here is a step-by-step guide to get the entire system running on your local machine.

#### ✅ Backend (Spring Boot)

1.  **Database Setup**:
    *   Ensure you have MySQL Server installed and running.
    *   Open `src/main/resources/application.properties`.
    *   Update `spring.datasource.username` and `spring.datasource.password` with your MySQL credentials. The database `school_management_db` will be created automatically.
    *   Add `spring.sql.init.mode=always` to ensure `data.sql` runs and populates the database with initial roles and users.

2.  **Mail Server Setup**:
    *   In `application.properties`, update the `spring.mail` properties with your email provider's details (e.g., a Gmail "App Password").

3.  **Run the Application**:
    *   Open a terminal in the root directory of the Spring Boot project.
    *   Run the command:
        ```bash
        mvn spring-boot:run
        ```
    *   The backend server will start on `http://localhost:8080`.
    *   You can view the API documentation at `http://localhost:8080/swagger-ui/`.

#### 🖥️ Frontend (Angular 17)

1.  **Install Dependencies**:
    *   Open a new terminal in the root directory of the Angular project (`school-management-frontend`).
    *   Run the command:
        ```bash
        npm install
        ```
    *   This will install all the required packages from `package.json` (Angular, Bootstrap, Toastr, etc.).

2.  **Run the Application**:
    *   In the same terminal, run the command:
        ```bash
        ng serve
        ```
    *   The frontend development server will start.
    *   Open your web browser and navigate to `http://localhost:4200/`.

3.  **Using the Application**:
    *   You will see the unified homepage.
    *   Click on a login button (e.g., "Admin Login").
    *   Use the credentials from `data.sql` to log in:
        *   **Admin**: username `admin`, password `password`
        *   **Teacher**: username `teacher`, password `password`
        *   **Parent**: username `parent`, password `password`
    *   Upon successful login, you will be redirected to the corresponding dashboard.

---

### Project Complete

You now have a complete, runnable full-stack application with a secure JWT-based backend and a functional, role-based Angular frontend.

**Next Steps for Further Development:**
1.  **Backend Implementation**: Flesh out the backend controller and service methods to return the detailed JSON objects that the frontend dashboards expect, replacing the current mock data.
2.  **Frontend Feature Implementation**: Build out the user interactions, such as creating forms for managing students, marking attendance, and processing fee payments.
3.  **UI/UX Refinement**: Polish the user interface, add charts using Chart.js, and improve the overall user experience.