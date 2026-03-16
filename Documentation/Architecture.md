# System Architecture

## Overview
The architecture of the Online Event Registration Portal follows a standard client-server model using the LAMP/WAMP stack (Linux/Windows, Apache, MySQL, PHP). The frontend and backend communicate asynchronously using AJAX to ensure a seamless user experience.

## Tech Stack
- **Frontend Layer**: HTML5, CSS3, JavaScript (ES6+), Bootstrap, jQuery
- **Backend Layer**: PHP 8.x
- **Data Layer**: MySQL / MariaDB

## Directory Structure

```text
srishti-awt/
├── app/                  # Core application logic
│   ├── helpers/          # Utility functions for backend processing
│   └── middleware/       # Middleware for request filtering/authentication
├── config/               # Configuration files
│   └── database.php      # Database connection setup
├── database/             # Database schemas and seeds
│   └── tech_event.sql    # Relational schema definition
├── public/               # Web root (Frontend files)
│   ├── index.html        # Landing page
│   ├── home.html         # User dashboard / Event listing
│   ├── admin-*.html      # Admin dashboards
│   ├── api/              # PHP API Endpoints for frontend consumption
│   │   ├── admin/        # Admin endpoints
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event data retrieval and registration endpoints
│   │   ├── teams/        # Team management endpoints
│   │   └── user/         # User profile and data endpoints
│   ├── css/              # Stylesheets
│   └── js/               # JavaScript functionality
└── README.md             # Project abstract and contributor details
```

## Data Flow
1. **User Interaction**: The user interacts with the UI (`public/*.html`), built with Bootstrap components.
2. **Client-side Processing**: jQuery handles form capture, prevents default submission, and performs frontend validation.
3. **AJAX Request**: An asynchronous `POST` or `GET` request is routed to a specific script in `public/api/`.
4. **Backend Processing**: The PHP scripts process the request, utilize shared logic from the `app/` and `config/` directories, and interact with the MySQL database.
5. **Response**: The server returns data (typically in JSON format), which jQuery uses to dynamically manipulate the DOM (e.g., updating remaining seats, confirming registration).
