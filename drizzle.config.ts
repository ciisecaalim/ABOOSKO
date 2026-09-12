import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is missing. Configure .env.local using .env.example.");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url },
});
