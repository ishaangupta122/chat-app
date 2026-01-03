import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // 🔒 Lock server/ folder from client-side usage
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "@/server/**"],
              message:
                "❌ server/ is backend-only. Do not import it into client-side code.",
            },
          ],
        },
      ],
    },
  },

  // ✅ Allow server imports inside API routes
  {
    files: ["src/app/api/**/*.{ts,js}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
