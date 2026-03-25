# LAD Frontend - Energy Management Platform

This is a complete React frontend for the LAD (Energy Management) platform.

## Features

### Authentication
- User registration with email and password
- JWT-based login with automatic token refresh
- Protected routes that redirect unauthenticated users to login
- Persistent login state using localStorage

### Task Management
- View all tasks with filtering (all, pending, completed)
- Create new tasks with title, description, status, priority, and due date
- Edit existing tasks
- Delete tasks
- Mark tasks as pending, in progress, or completed
- Task priority levels (low, medium, high)

### Daily Logs
- View all daily logs sorted by date
- Create daily logs with date, energy consumption (kWh), notes, and status
- Edit existing daily logs
- Delete daily logs
- Track energy consumption over time

### User Profile
- View user account information
- Logout functionality

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Main header with navigation
│   ├── ProtectedRoute.jsx      # Route guard for authenticated pages
│   ├── TaskForm.jsx            # Form for creating/editing tasks
│   ├── TaskCard.jsx            # Task display card
│   ├── DailyLogForm.jsx        # Form for creating/editing daily logs
│   └── DailyLogCard.jsx        # Daily log display card
├── context/
│   └── AuthContext.jsx         # Authentication state management
├── hooks/
│   ├── useAuth.js              # Hook for accessing auth context
│   └── useLocalStorage.js      # Hook for localStorage management
├── pages/
│   ├── LoginPage.jsx           # Login page
│   ├── RegisterPage.jsx        # User registration page
│   ├── TasksPage.jsx           # Tasks list and management
│   ├── DailyLogsPage.jsx       # Daily logs list and management
│   ├── ProfilePage.jsx         # User profile page
│   └── NotFoundPage.jsx        # 404 error page
├── services/
│   ├── api.js                  # Axios instance with JWT interceptors
│   ├── auth.js                 # Authentication API calls
│   ├── tasks.js                # Tasks CRUD API calls
│   └── dailyLogs.js            # Daily logs CRUD API calls
├── styles/
│   ├── index.css               # Global styles
│   ├── header.css              # Header component styles
│   ├── auth.css                # Auth pages styles
│   ├── error-page.css          # Error page styles
│   ├── tasks.css               # Tasks page styles
│   ├── task-form.css           # Task form styles
│   ├── task-card.css           # Task card styles
│   ├── daily-logs.css          # Daily logs page styles
│   ├── daily-log-form.css      # Daily log form styles
│   ├── daily-log-card.css      # Daily log card styles
│   └── profile.css             # Profile page styles
├── App.jsx                     # Main app component with routing
├── main.jsx                    # App entry point
└── index.html                  # HTML template
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Update .env.local with your backend API URL:**
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Technologies Used

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with JWT interceptor support
- **date-fns** - Date utility library
- **Vite** - Build tool and dev server

### Architecture

**State Management:**
- Uses React Context API with useContext hook
- Auth state managed in AuthContext
- Component-level state with useState for forms and local data

**API Communication:**
- Centralized axios instance in `src/services/api.js`
- Request interceptor automatically adds JWT token to all requests
- Response interceptor handles token refresh on 401 errors
- Service functions in separate files (auth, tasks, dailyLogs)

**Authentication Flow:**
1. User registers or logs in
2. Backend returns access and refresh tokens
3. Tokens stored in localStorage
4. Access token included in Authorization header for all requests
5. On token expiry (401 response), automatic refresh with refresh token
6. New tokens stored and original request retried

**Protected Routes:**
- ProtectedRoute component checks isAuthenticated and isLoading
- Redirects to login if not authenticated
- Shows loading spinner while checking auth status

## API Integration

The frontend expects the backend API to:

1. **Registration**: POST /api/auth/register/
   - Request: `{ email, password }`
   - Response: Success message or validation errors

2. **Login**: POST /api/auth/login/
   - Request: `{ email, password }`
   - Response: `{ access, refresh, user }`

3. **Token Refresh**: POST /api/auth/refresh/
   - Request: `{ refresh }`
   - Response: `{ access, refresh? }`

4. **Get User Info**: GET /api/auth/me/
   - Response: User object with email, id, etc.

5. **Tasks CRUD**:
   - GET /api/tasks/ - List all tasks
   - POST /api/tasks/ - Create task
   - PATCH /api/tasks/{id}/ - Update task
   - DELETE /api/tasks/{id}/ - Delete task

6. **Daily Logs CRUD**:
   - GET /api/daily-logs/ - List all logs
   - POST /api/daily-logs/ - Create log
   - PATCH /api/daily-logs/{id}/ - Update log
   - DELETE /api/daily-logs/{id}/ - Delete log

## Styling

- **CSS-in-JSX**: All styles are in `.css` files imported into components
- **CSS Variables**: Global theme colors defined in `src/styles/index.css`
- **Responsive Design**: Mobile-first approach with media queries
- **BEM-like Naming**: Class names follow `component-element` pattern

### Theme Colors

- Primary: #2563eb (blue)
- Secondary: #64748b (slate)
- Success: #10b981 (green)
- Warning: #f59e0b (amber)
- Danger: #ef4444 (red)

## Error Handling

- API errors caught and displayed to user
- Form validation with error messages
- Automatic redirect to login on authentication failure
- Error banners on task/log pages
- Network error handling with user feedback

## Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Pagination for large task/log lists
- [ ] Advanced filtering and search
- [ ] Data export (CSV, PDF)
- [ ] Task categories/tags
- [ ] Energy consumption analytics and charts
- [ ] Email notifications
- [ ] Dark mode theme
- [ ] Unit tests with Vitest
