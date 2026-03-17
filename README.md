# Srishti 2026 - Online Event Registration Portal

## Overview
The **Online Event Registration Portal** is a responsive web-based application designed to streamline and modernize the process of managing event registrations for a college technology festival. It provides a digital solution that allows students to easily view event details, form teams, and register online through a user-friendly and interactive platform.

The system features:
- **Student Portal:** Browse events with a dynamic card interface showing available seats. Students can register for solo events, form teams for group events, view their registrations, and update their profile.
- **Admin Dashboard:** A secured area for admins to Create, Read, Update, and Delete events. Admins can view detailed lists of registered participants and track seat availability dynamically.
- **De-registration & Teams:** Users can de-register from events, and team leaders have the authority to disband teams securely.
- **AJAX-driven Validation:** Comprehensive client-side jQuery and server-side PHP validation for all forms (Signup, Login, Event action, Profile updates).

## How to Run This Project

1. **Prerequisites**: Ensure you have a functional stack running PHP and MySQL/MariaDB (e.g., LAMP, XAMPP, WAMP).
2. **Setup Workspace**: Clone this repository into your local web server's root directory (e.g., `/srv/http/`, `/var/www/html/`, or `htdocs/`).
3. **Database Initialization**: 
   - Open your MySQL client (e.g., phpMyAdmin or CLI).
   - Import the `database/tech_event.sql` file. This will automatically create the `tech_event` database, build all necessary tables, and inject seed data (including test users and events).
4. **Environment Variables**:
   - In the root of the project folder, locate or create a `.env` file.
   - Configure your local database credentials like so:
     ```ini
     DB_HOST=localhost
     DB_NAME=tech_event
     DB_USER=root
     DB_PASS=your_password
     ```
5. **Access the Site**: Open your browser and navigate to `http://localhost/srishti-awt/public/index.html`.
   - *Note: To test admin permissions, you can log in with the seeded admin account `admin@test.com` (password: `123456`).*

## Database Schema Details

The application uses an interconnected relational database featuring 5 primary tables:

- **`users`**
  Stores both student and admin user accounts. Fields include `id`, `name`, `email`, `password` (hashed), `role` (user/admin), `phone`, `branch`, and `year_of_passing`.
- **`events`**
  Stores all events available at the TechFest. Managed by admins. Fields include `title`, `description`, `event_date`, `max_participants`, `event_type` (solo/team), `team_min`, and `team_max`.
- **`event_registrations`**
  The junction table for tracking solo event participations. Maps a `user_id` to an `event_id`.
- **`teams`**
  Tracks team creations for group events. Fields include `team_name`, `event_id` (foreign key to the event), and `created_by` (foreign key to the leader).
- **`team_members`**
  Maps multiple users to a single team. Fields include `team_id`, `user_id`, and `role` (ENUM: leader, member). Tied to `teams` with an `ON DELETE CASCADE` rule (deleting a team deletes its members).

## Team Details

| Member | Role | Task Description |
| :--- | :--- | :--- |
| Akash A | Project Leader | Coordinate team, manage Git/project folder, ensure integration of modules |
| Abhinand KK | UI Designer | Design layout, wireframe, color scheme |
| Albin Suresh | HTML Developer | Develop semantic HTML structure |
| Alfiya Ismail | CSS Developer | Implement styling and responsive design |
| Akshai Raj | Bootstrap Developer | Create responsive components using Bootstrap |
| Abhinanth S Pillai | JavaScript Developer | Implement client-side logic |
| Abhilash KK | jQuery Developer | Implement form validation and DOM manipulation |
| Abhinand M A | AJAX Developer | Handle asynchronous requests |
| Adonia Cyrus | PHP Backend Developer | Develop server-side logic |
| Alka Maria Jiss | Database Designer | Design MySQL tables and queries |
| Amal S Kumar | Integration Engineer | Connect frontend with backend |
| Aleena Roby | Tester & Documentation | Testing, debugging, documentation, demo preparation. |
