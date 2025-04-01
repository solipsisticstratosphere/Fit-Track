# FitTrack

FitTrack is a comprehensive fitness tracking application built with Next.js and Supabase. It allows users to track workouts, meals, and weight progress all in one place.

## Features

- **User Authentication**: Secure login and registration
- **Workout Tracking**: Log exercises, sets, reps, and weights
- **Meal Logging**: Track nutrition information and meal planning
- **Weight Monitoring**: Record weight progress over time
- **Dashboard**: View all your fitness stats in one place

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (via Supabase)
- NextAuth.js for authentication

## Getting Started

1. Clone the repository

```bash
git clone <repository-url>
cd fit-track
```

2. Install dependencies

```bash
npm install
```

3. Set up your environment variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Generate Prisma client

```bash
npx prisma generate
```

5. Run the development server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable components
- `/src/lib` - Utility functions and shared logic
- `/prisma` - Database schema and Prisma configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
