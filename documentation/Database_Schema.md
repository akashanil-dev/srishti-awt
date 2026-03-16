# Database Schema

The database `tech_event` manages all persistent data for the application.

## Entity-Relationship Breakdown

### `users`
Stores user profile credentials and details.
- `id` (INT, PK, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique) 
- `password` (VARCHAR, hashed)
- `role` (ENUM: 'user', 'admin' - Defaults to 'user')
- `created_at` (TIMESTAMP)
- `phone` (VARCHAR)
- `branch` (VARCHAR, Optional)
- `year_of_passing` (INT, Optional)

### `events`
Details regarding the festival's activities.
- `id` (INT, PK, Auto Increment)
- `title` (VARCHAR)
- `description` (TEXT)
- `event_date` (DATE)
- `max_participants` (INT)
- `created_by` (INT, FK -> users(id))
- `created_at` (TIMESTAMP)
- `event_type` (VARCHAR: 'solo' or 'team')
- `team_min` (INT, Optional)
- `team_max` (INT, Optional)

### `event_registrations`
Tracks individual enrollment to specific events.
- `id` (INT, PK, Auto Increment)
- `user_id` (INT, FK -> users(id))
- `event_id` (INT, FK -> events(id))
- `registered_at` (TIMESTAMP)
*Note: A unique constraint exists on `(user_id, event_id)` to prevent duplicate registrations.*

### `teams`
Manages team groupings for collaborative events.
- `id` (INT, PK, Auto Increment)
- `team_name` (VARCHAR)
- `event_id` (INT, FK -> events(id))
- `created_by` (INT, FK -> users(id))
- `created_at` (TIMESTAMP)

### `team_members`
Maps users to specific teams (Many-to-Many resolution table).
- `id` (INT, PK, Auto Increment)
- `team_id` (INT, FK -> teams(id))
- `user_id` (INT, FK -> users(id))
*Note: A unique constraint exists on `(team_id, user_id)` to ensure users aren't added to the same team twice.*

## Relationships
- **User -> Events:** 1:N (Admin users create multiple events)
- **User -> Registrations -> Events:** N:M (Users register for many events, events have many users)
- **Events -> Teams:** 1:N (A team-based event has multiple registered teams)
- **User -> Team Members -> Teams:** N:M (Users form multiple teams for different events)
