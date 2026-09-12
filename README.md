# Local development

1. Run npm install.
2. Copy .env.example to .env.local and set DATABASE_URL to your actual PostgreSQL connection string. URL-encode special characters in the password. Never commit .env.local.
3. Ensure the database named in the URL exists (the example uses app_db). Create it in pgAdmin if necessary.
4. Run npm run db:check to verify authentication.
5. Run npm run db:push to create/update the application tables. Review schema change prompts before applying changes to a database with existing data.
6. Run npm run dev. Restart after changing credentials because the development server caches its connection pool.

The application and Drizzle commands use the same DATABASE_URL, with Next.js environment file loading. An existing shell environment variable takes precedence over .env.local.

PostgreSQL error 28P01 means the server rejected the username/password. Correct the credentials, verify with npm run db:check, then restart the development server.
