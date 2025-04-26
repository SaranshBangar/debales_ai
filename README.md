# Welcome to your Lovable project

## Project Overview

A modern AI dashboard application built with React, TypeScript, and shadcn/ui components. This project features user authentication, real-time data visualization, and responsive design.

## How to clone and set up this project

1. Clone the repository:

```sh
git clone https://github.com/SaranshBangar/debales_ai.git
cd debales_ai
```

2. Install dependencies:

```sh
npm install
```

3. Start the development server:

```sh
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:8080`

## Important Note About Environment Variables

This project uses Supabase for managing environment variables and secrets. You don't need to create any `.env` files. The necessary public configuration is already included in the project files.

- If you need to add API keys or secrets, use the Supabase dashboard
- The Supabase configuration is already set up in `src/integrations/supabase/client.ts`

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Deployment

To deploy this project:

1. Open [Lovable](https://lovable.dev/projects/a5e0e06b-2fdd-4b70-909f-48cb07384c00)
2. Click on Share -> Publish

## Custom Domain Setup

You can connect a custom domain to your project:

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the instructions in [our documentation](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
