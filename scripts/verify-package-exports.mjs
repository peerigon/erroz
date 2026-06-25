import { spawnSync } from "node:child_process";

const checks = [
  {
    name: "native ESM named import",
    args: [
      "--input-type=module",
      "--eval",
      "import { erroz, AbstractError } from 'erroz'; if (typeof erroz !== 'function' || typeof erroz.options !== 'object' || typeof AbstractError !== 'function') process.exit(1);",
    ],
  },
  {
    name: "CommonJS require",
    args: [
      "--eval",
      "const { erroz, AbstractError } = require('erroz'); if (typeof erroz !== 'function' || typeof erroz.options !== 'object' || typeof AbstractError !== 'function') process.exit(1);",
    ],
  },
];

for (const check of checks) {
  const result = spawnSync(process.execPath, check.args, {
    cwd: new URL("..", import.meta.url),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`Package export check failed: ${check.name}`);
    process.exit(result.status ?? 1);
  }
}
