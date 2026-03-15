# Vaidya Sahay

Vaidya Sahay is a comprehensive healthcare management system built with Next.js, designed to assist in early diagnosis, patient management, hospital operations, and predictive risk assessment. It leverages modern web technologies to provide an efficient platform for healthcare professionals and patients.

## Features

- **Early Diagnosis**: Analyze symptoms and provide preliminary diagnostic insights.
- **Patient Management**: Manage patient records, actions, and recovery tracking.
- **Hospital Management**: Oversee hospital resources and operations.
- **Predictive Risk Assessment**: Predict health risks using data-driven algorithms.
- **Workflow Optimization**: Optimize healthcare workflows for better efficiency.
- **Resource Management**: Handle resource requests and allocations.
- **Admin Panel**: Administrative controls for approvals and system management.
- **User Authentication**: Secure login system for users.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite/PostgreSQL
- **Styling**: Tailwind CSS, PostCSS
- **Deployment**: Vercel (recommended)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd vaidya-sahay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up the database**:
   - Configure your database in `prisma/schema.prisma`.
   - Run Prisma migrations:
     ```bash
     npx prisma migrate dev
     ```
   - Seed the database (if applicable):
     ```bash
     npx prisma db seed
     ```

4. **Environment Variables**:
   - Create a `.env.local` file and add necessary environment variables (e.g., database URL, API keys).

## Usage

1. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Navigate to different sections:
   - `/early-diagnosis`: Early diagnosis page
   - `/hospital`: Hospital management
   - `/patient`: Patient dashboard
   - `/predictive-risk`: Risk prediction
   - `/login`: User login

## API Endpoints

The application provides several API endpoints under `/api/`:

- `/api/admin`: Administrative functions
- `/api/approvals`: Approval workflows
- `/api/diagnosis/analyze`: Diagnostic analysis
- `/api/hospitals`: Hospital data management
- `/api/patients`: Patient records and actions
- `/api/recovery`: Recovery tracking
- `/api/resources`: Resource management and requests
- `/api/risk/predict`: Risk prediction
- `/api/workflow/optimize`: Workflow optimization

Refer to the API route files in `src/app/api/` for detailed implementation.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
