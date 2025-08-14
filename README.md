# Grocery POS & Inventory System

A complete React Native Expo app for grocery store point-of-sale and inventory management, built with Supabase for real-time data synchronization and offline-first functionality.

## Features

### 🔐 Authentication & Onboarding
- Email/password authentication with Supabase Auth
- Store setup with photo upload during onboarding
- Automatic navigation based on auth and store status

### 📊 Real-time Dashboard
- Live metrics: total revenue, today's sales, customer count, total orders
- Real-time updates via Supabase Realtime subscriptions
- Quick action buttons for common tasks
- Offline sync status indicator

### 👥 Customer Management
- Add, edit, and search customers
- Customer purchase history and ledger
- Payment tracking and outstanding balance management

### 🏪 Supplier Management
- Supplier contact information and delivery tracking
- Delivery recording with itemized costs
- Purchase order management

### 📦 Inventory Management
- Product catalog with images, pricing, and stock levels
- Stock adjustment tracking with reason codes
- Low stock alerts and reorder level management
- Category-based filtering and search

### 💰 Point of Sale (POS)
- Cart-based sale creation with customer selection
- Real-time inventory validation and stock updates
- Multiple payment methods (cash, card, UPI)
- Partial payment support with balance tracking
- Offline sale capability with background sync

### 📄 Invoice Generation
- Professional PDF invoice generation with store branding
- Customer details and itemized line items
- Tax calculation and payment status
- Share functionality via native sharing

### 📈 Reports & Analytics
- Sales reports by date range
- Inventory status reports
- Outstanding payments tracking
- CSV export functionality

### 🔄 Offline-First Architecture
- Local data caching with AsyncStorage
- Background synchronization when online
- Conflict resolution with timestamp-based strategy
- Pending sync indicator and manual sync option

## Tech Stack

- **Frontend**: React Native with Expo managed workflow
- **Backend**: Supabase (Database, Auth, Realtime, Storage)
- **Navigation**: Expo Router with TypeScript support
- **State Management**: React hooks with real-time subscriptions
- **Offline Storage**: AsyncStorage for offline data persistence
- **UI Components**: Custom component library with consistent design
- **Forms**: React Hook Form with Yup validation
- **PDF Generation**: react-native-print for invoice creation
- **Image Handling**: Expo ImagePicker with Supabase Storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Clone and Install

```bash
git clone <repository-url>
cd grocery-pos-system
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the content from supabase/migrations/001_initial_schema.sql
# and run it in your Supabase project's SQL editor
```

### 4. Storage Buckets

Create the following storage buckets in your Supabase project:

1. Go to Storage in your Supabase dashboard
2. Create bucket: `store-images` (public)
3. Create bucket: `item-images` (public)

### 5. Row Level Security Policies

The migration includes RLS policies that ensure:
- Users can only access data for stores they own
- Complete data isolation between different store owners
- Secure access to images and files

### 6. Run the App

```bash
# Start the development server
npm run dev

# For Android
expo run:android

# For iOS
expo run:ios

# For web
expo start --web
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (onboarding)/      # Store setup flow
│   ├── (tabs)/            # Main app tabs
│   ├── customers/         # Customer management
│   ├── suppliers/         # Supplier management
│   ├── inventory/         # Inventory management
│   ├── sales/             # Sales and POS
│   └── settings/          # Settings and reports
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── services/             # External service integrations
├── types/                # TypeScript type definitions
└── supabase/             # Database migrations
```

## Key Components

### Authentication Flow
- **SignUp/SignIn**: Email/password authentication
- **Store Setup**: Required onboarding for new users
- **Navigation**: Automatic routing based on auth status

### Real-time Features
- Dashboard metrics update automatically
- Inventory changes reflected immediately
- Sales notifications across devices
- Customer data synchronization

### Offline Capabilities
- Queue sales when offline
- Local data persistence
- Background sync on reconnection
- Conflict resolution strategies

### Invoice System
- Professional PDF generation
- Store branding with logo
- Detailed line items and totals
- Tax calculations and payment tracking

## Database Schema

### Core Tables
- `stores` - Store information and settings
- `customers` - Customer contact and purchase history
- `suppliers` - Supplier information and delivery tracking
- `inventory_items` - Product catalog with pricing and stock
- `sales` - Transaction records with payment status
- `sale_items` - Individual line items for each sale
- `payments` - Payment tracking and history
- `deliveries` - Supplier delivery records
- `stock_adjustments` - Inventory movement tracking

### Security
- Row Level Security (RLS) enabled on all tables
- Store-based data isolation
- User-specific access controls
- Secure file upload and access

## API Integration

### Supabase Services
- **Auth**: User authentication and session management
- **Database**: PostgreSQL with real-time subscriptions
- **Storage**: Image and file upload with CDN
- **Realtime**: Live data synchronization across devices

### Offline Sync Strategy
1. Store operations locally when offline
2. Queue changes in AsyncStorage
3. Sync on network reconnection
4. Handle conflicts with timestamp comparison
5. Provide user feedback for sync status

## Building for Production

### Android APK
```bash
# Build for Android
expo build:android --type apk

# Or with EAS Build (recommended)
eas build --platform android
```

### iOS App
```bash
# Build for iOS
expo build:ios

# Or with EAS Build (recommended)
eas build --platform ios
```

## Testing

The app includes basic validation and error handling for:
- Form validation with proper error messages
- Network connectivity handling
- Image upload error recovery
- Database transaction integrity
- Offline data persistence

## Deployment

### Using EAS Build (Recommended)

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`

### Environment Setup for Production

1. Set up production Supabase project
2. Configure production environment variables
3. Update RLS policies for production security
4. Set up proper backup and monitoring

## Support

For issues and questions:
1. Check the Expo documentation
2. Review Supabase documentation for database issues
3. Check React Native compatibility for new packages
4. Ensure proper environment variable configuration

## License

This project is licensed under the MIT License.