# Employee Management System

A comprehensive, production-ready web application for tracking employee working hours, calculating salaries, and managing company notifications.

![Employee Management System](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)

## 🚀 Features

### For Employees
- ✅ **Check-In/Check-Out System** - Track daily attendance with one click
- 📊 **Work Hours Summary** - View daily, weekly, and monthly hours
- 💰 **Salary Dashboard** - See estimated earnings and payment history
- 🔔 **Notifications** - Receive important company updates
- 📱 **Mobile-Responsive** - Access from any device

### For Administrators
- 👥 **User Management** - Create and manage employee accounts
- 📈 **Analytics Dashboard** - Real-time statistics and insights
- 💼 **Payroll Management** - Calculate and track salaries
- 📋 **Attendance Reports** - Export and analyze attendance data
- 🔐 **Audit Logs** - Track all system changes
- 📢 **Announcements** - Create targeted notifications

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Headless UI patterns
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- A Supabase account ([Create one free](https://supabase.com))

### Step 1: Clone and Install
```bash
cd employee-management-system
npm install
```

### Step 2: Set Up Supabase

1. **Create a new Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in project details and create

2. **Run the database schema**
   - In Supabase Dashboard, go to SQL Editor
   - Open `database/schema.sql` from this project
   - Copy and paste the entire SQL content
   - Click "Run" to execute

3. **Get your credentials**
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

### Step 3: Environment Configuration

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Create Admin User

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User"
3. Fill in:
   - Email: `admin@company.com`
   - Password: your secure password
   - Auto Confirm User: ✅ (checked)
4. After creating, go to SQL Editor and run:
```sql
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'admin@company.com';
```

**Option B: Via SQL**
```sql
-- Insert admin user (replace email and password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@company.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin User", "role": "admin"}'::jsonb,
  NOW(),
  NOW()
);
```

### Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### Initial Login
1. Navigate to `http://localhost:3000`
2. Login with your admin credentials
3. You'll be redirected to the Admin Dashboard

### Creating Employees
1. Go to **Admin → Users**
2. Click "Add Employee"
3. Fill in employee details:
   - Email
   - Password
   - Full Name
   - Salary Type (Hourly/Monthly)
   - Rate/Salary Amount
4. Click "Create"

### Employee Check-In Flow
1. Employee logs in with their credentials
2. On the dashboard, click "Check In"
3. Work hours are automatically tracked
4. Click "Check Out" when leaving
5. System calculates total hours worked

### Managing Salaries
1. Go to **Admin → Payroll**
2. Select employee and date range
3. System auto-calculates based on:
   - **Hourly**: hours worked × hourly rate
   - **Monthly**: fixed monthly salary
4. Add bonuses/deductions if needed
5. Mark as "Paid" when processed

### Creating Notifications
1. Go to **Admin → Notifications**
2. Click "Create Notification"
3. Fill in:
   - Title
   - Message
   - Priority (Normal/Important/Urgent)
   - Target (All/Employee/Admin)
4. Click "Send"

## 📊 Database Schema

The application uses 7 main tables:

- `profiles` - User accounts and roles
- `attendance` - Check-in/check-out records
- `salary_records` - Payroll information
- `notifications` - Company announcements
- `notification_reads` - Read status tracking
- `audit_logs` - System activity logs

View the complete schema in `database/schema.sql`.

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure session management
- **Role-Based Access Control** - Employee vs Admin permissions
- **Audit Logging** - Track all critical actions
- **Password Hashing** - bcrypt encryption
- **HTTPS Ready** - Secure in production

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (your production URL)
   - Click "Deploy"

3. **Update Supabase Settings**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add to "Redirect URLs"

## 📝 API Documentation

### Attendance Endpoints
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create record (admin only)

### Salary Endpoints
- `GET /api/salary` - Get salary records
- `POST /api/salary` - Create salary record (admin only)
- `PUT /api/salary/[id]` - Update salary record (admin only)

### Notification Endpoints
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification (admin only)
- `POST /api/notifications/[id]/read` - Mark as read

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)

## 🎨 Customization

### Changing Theme Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: 217 91% 60%;  /* Main blue color */
  --accent: 262 80% 65%;   /* Purple accent */
  /* ... other colors */
}
```

### Adding New Features

1. Create database migration in `database/migrations/`
2. Add TypeScript types in `src/types/index.ts`
3. Create API route in `src/app/api/`
4. Build UI components in `src/components/`
5. Add page in `src/app/(dashboard)/`

## 🐛 Troubleshooting

### "Unauthorized" Errors
- Check `.env.local` has correct Supabase credentials
- Verify user is logged in
- Check browser console for auth errors

### Database Connection Issues
- Verify Supabase project is active
- Check RLS policies are enabled
- Ensure database schema is properly created

### Build Errors
- Run `npm install` to ensure all dependencies
- Delete `.next` folder and rebuild
- Check Node.js version is 18+

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase and Next.js documentation
3. Open an issue on GitHub

---

**Built with ❤️ using Next.js and Supabase**
