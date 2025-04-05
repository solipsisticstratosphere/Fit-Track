# FitTrack

[English](#english) | [Українська](#ukrainian)

<a id="english"></a>

## FitTrack - Your Personal Fitness Companion

FitTrack is a comprehensive fitness tracking application built with Next.js and Supabase. It empowers users to take control of their fitness journey by providing tools to track workouts, nutrition, body measurements, and progress all in one place.

### Key Features

- **User Authentication**: Secure login, registration, and profile management
- **Workout Tracking**:
  - Create custom workout routines
  - Log exercises with sets, reps, and weights
  - Track workout history and see progress over time
  - Copy previous workouts as templates
  - Calendar view for workout scheduling
- **Nutrition Management**:
  - Log daily meals with nutrition information
  - Track calories, macros, and micronutrients
  - Create custom meals and recipes
  - Visualize nutrition trends over time
- **Weight and Body Tracking**:
  - Monitor weight changes with interactive charts
  - Set weight goals and track progress
  - Record body measurements
  - Calculate BMI and other health metrics
- **Dashboard**:
  - Comprehensive overview of your fitness journey
  - Customizable widgets for the metrics that matter most to you
  - Progress indicators and achievements
- **Reports and Analytics**:
  - Detailed performance analysis
  - Historical comparisons to track improvements
  - Export functionality for sharing with trainers

### Technologies Used

- **Frontend**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Chart.js for data visualization
  - React Context for state management
- **Backend**:
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL (via Supabase)
  - NextAuth.js for authentication
- **DevOps**:
  - Vercel deployment

### Getting Started

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

### Project Structure

- `/src/app` - Next.js App Router pages and layouts
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions, hooks, and shared logic
- `/prisma` - Database schema and Prisma configuration
- `/public` - Static assets and images

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<a id="ukrainian"></a>

## FitTrack - Ваш особистий фітнес-помічник

FitTrack - це комплексний додаток для відстеження фітнесу, створений з використанням Next.js та Supabase. Він дозволяє користувачам контролювати свій фітнес-шлях, надаючи інструменти для відстеження тренувань, харчування, вимірювань тіла та прогресу в одному місці.

### Основні функції

- **Аутентифікація користувачів**: Безпечний вхід, реєстрація та управління профілем
- **Відстеження тренувань**:
  - Створення індивідуальних програм тренувань
  - Запис вправ з підходами, повтореннями та вагою
  - Відстеження історії тренувань та перегляд прогресу
  - Копіювання попередніх тренувань як шаблонів
  - Календарний вигляд для планування тренувань
- **Управління харчуванням**:
  - Ведення щоденного харчування з інформацією про поживну цінність
  - Відстеження калорій, макро- та мікроелементів
  - Створення власних страв та рецептів
  - Візуалізація тенденцій харчування
- **Відстеження ваги та тіла**:
  - Моніторинг змін ваги за допомогою інтерактивних графіків
  - Встановлення цілей щодо ваги та відстеження прогресу
  - Запис вимірювань тіла
  - Розрахунок ІМТ та інших показників здоров'я
- **Панель приладів**:
  - Комплексний огляд вашого фітнес-шляху
  - Налаштовувані віджети для показників, які мають для вас найбільше значення
  - Індикатори прогресу та досягнення
- **Звіти та аналітика**:
  - Детальний аналіз продуктивності
  - Історичні порівняння для відстеження покращень
  - Функція експорту для обміну з тренерами

### Використані технології

- **Фронтенд**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Chart.js для візуалізації даних
  - React Context для управління станом
- **Бекенд**:
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL (через Supabase)
  - NextAuth.js для аутентифікації
- **DevOps**:
  - Розгортання на Vercel

### Початок роботи

1. Клонуйте репозиторій

```bash
git clone <repository-url>
cd fit-track
```

2. Встановіть залежності

```bash
npm install
```

3. Налаштуйте змінні середовища

Створіть файл `.env` в кореневому каталозі з такими змінними:

```
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-direct-url"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Згенеруйте клієнт Prisma

```bash
npx prisma generate
```

5. Запустіть сервер розробки

```bash
npm run dev
```

6. Відкрийте [http://localhost:3000](http://localhost:3000) у вашому браузері

### Структура проекту

- `/src/app` - Сторінки та макети Next.js App Router
- `/src/components` - Компоненти користувацького інтерфейсу для повторного використання
- `/src/lib` - Утилітарні функції, хуки та спільна логіка
- `/prisma` - Схема бази даних та конфігурація Prisma
- `/public` - Статичні ресурси та зображення

### Участь у розробці

Внески вітаються! Будь ласка, не соромтеся подавати Pull Request.

## Author

- Ярослав Кліменко (Yaroslav Klimenko)

### Connect with me | Зв'язатися зі мною:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/klimenko-yaroslav/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/solipsisticstratosphere)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/nosebl33d)
