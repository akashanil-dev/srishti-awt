# API Reference

The application features a modular REST-like API structured within the `public/api` directory. All endpoints are accessed via HTTP requests and typically return JSON payloads.

## Authentication Endpoints (`/api/auth/`)

### `check_session.php`
- **Method**: `GET`
- **Purpose**: Verifies if the user is currently authenticated by checking the active PHP session. Returns user roles and details if active.

### `login.php`
- **Method**: `POST`
- **Payload**: `email`, `password`
- **Purpose**: Authenticates a user against the `users` table, generating a session if credentials are correct.

### `signup.php`
- **Method**: `POST`
- **Payload**: User registration details (e.g., `name`, `email`, `password`, `phone`, `branch`, `year_of_passing`).
- **Purpose**: Creates a new user account with a securely hashed password.

### `logout.php`
- **Method**: `POST` / `GET`
- **Purpose**: Destroys the current user session.

## Event Endpoints (`/api/events/`)

### `get_events.php`
- **Method**: `GET`
- **Purpose**: Fetches the total list of upcoming events. Includes details like max participants and current seat availability. 

### `get_event_participants.php`
- **Method**: `GET` (with `event_id` query parameter)
- **Purpose**: Returns the list of enrolled participants/teams for a specific event. Used to populate the real-time participant list modal.

### `register_event.php`
- **Method**: `POST`
- **Payload**: `event_id`, and user contextual info.
- **Purpose**: Enrolls the authenticated user into the event. It verifies availability, validates rules (e.g., solo vs team events), and creates a record in `event_registrations`. Returns a success or error response accordingly.

## Team Endpoints (`/api/teams/`)
- Contains endpoints likely related to creating a team, retrieving team members, and verifying team constraints for team-based events (e.g., minimum and maximum sizes).

## Admin Endpoints (`/api/admin/`)
- Contains endpoints reserved for users with the `admin` role, including event creation/deletion, generating reports, and overseeing registrations.

## User Endpoints (`/api/user/`)
- Contains endpoints for users to manage their profile and retrieve a history of their registered events.
