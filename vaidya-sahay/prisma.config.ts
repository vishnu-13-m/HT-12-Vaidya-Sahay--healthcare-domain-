// This file is kept for tooling compatibility, but Prisma v5 no longer provides a runtime
// `defineConfig` export from "prisma/config". The schema path is configured in `prisma/schema.prisma`.

import "dotenv/config";

const config = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: "sqlite",
    url: "file:./dev.db",
  },
};

export default config;

