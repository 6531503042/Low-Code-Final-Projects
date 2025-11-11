# MeeRaiKin Admin Dashboard

A modern admin dashboard built with Next.js 14, HeroUI, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Login/logout with JWT tokens
- 📊 **Dashboard**: Overview statistics and metrics
- 👥 **User Management**: CRUD operations for users
- 🍽️ **Menu Management**: CRUD operations for menu items
- ⚙️ **Preferences**: User preference management
- 📅 **Schedules**: User schedule management
- 📋 **Audit Logs**: System activity tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: HeroUI (React components)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication

The admin dashboard requires authentication. Use the following credentials:

- **Email**: admin@gmail.com
- **Password**: admin123

## API Integration

The dashboard connects to the backend API running on `http://localhost:8080`. Make sure the backend is running before using the admin dashboard.

## Project Structure

```
app/
├── (auth)/           # Authentication routes
│   ├── login/        # Login page
│   └── logout/        # Logout page
├── (app)/            # Protected admin routes
│   ├── dashboard/    # Dashboard overview
│   ├── users/        # User management
│   ├── menus/        # Menu management
│   ├── preferences/  # Preference management
│   ├── schedules/    # Schedule management
│   └── audit-logs/   # Audit logs
├── layout.tsx        # Root layout
└── providers.tsx     # App providers

hooks/                # Custom React hooks
├── useAuth.ts       # Authentication hook
├── useUsers.ts      # User management hook
├── useMenus.ts      # Menu management hook
└── ...

utils/               # Utility functions
├── api.ts           # Server-side API calls
└── client-api.ts    # Client-side API calls

types/               # TypeScript type definitions
├── user.d.ts        # User types
├── menu.d.ts        # Menu types
└── ...
```

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`
- **Type Check**: `npm run type-check`

## Features in Detail

### Dashboard
- Real-time statistics
- Quick access to all modules
- User information display

### User Management
- Create, read, update, delete users
- Search and filter functionality
- Role-based access control

### Menu Management
- Full CRUD operations for menu items
- Image upload support
- Category and cuisine management

### Preferences & Schedules
- User preference management
- Schedule configuration
- Dietary restrictions and allergies

### Audit Logs
- System activity tracking
- User action logging
- Security monitoring

## Security

- JWT token-based authentication
- Protected routes with middleware
- Role-based access control
- Secure API communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the MeeRaiKin meal recommendation system.