# Prettier Setup RFC

## What Was Implemented

Installed and configured Prettier for the ops-ui repo to work alongside the existing ESLint setup. The configuration enforces consistent code formatting with no semicolons, single quotes, and 2-space indentation.

## Key Files Changed

| File                    | Action   | Description                                                                       |
| ----------------------- | -------- | --------------------------------------------------------------------------------- |
| `package.json`          | Modified | Added `prettier` (v3.8.1), `eslint-config-prettier` (v10.1.8), and format scripts |
| `.prettierrc`           | Created  | Prettier configuration (no semi, single quotes, 2-space tabs)                     |
| `.prettierignore`       | Created  | Excludes build outputs, node_modules, generated files                             |
| `eslint.config.mjs`     | Modified | Added eslint-config-prettier to disable conflicting rules                         |
| `.vscode/settings.json` | Created  | Format-on-save with Prettier as default formatter                                 |

## Design Decisions

1. **No semicolons** (`semi: false`) - Per user preference
2. **Single quotes** (`singleQuote: true`) - Per user preference
3. **Spaces over tabs** (`useTabs: false`) - Explicit preference for 2-space indentation
4. **eslint-config-prettier last** - Must be last in ESLint config to properly override conflicting rules
5. **VS Code integration** - Format-on-save enabled for TypeScript, JavaScript, and JSON files

## npm Scripts Added

```json
"lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

## Testing Performed

1. `npm install` - Packages installed successfully
2. `npm run format:check` - Prettier correctly identifies files needing formatting
3. `npm run lint` - ESLint runs without configuration conflicts
4. `npx tsc --noEmit` - TypeScript compiles without errors

## Next Steps

Run `npm run format` to apply Prettier formatting to all files in the codebase. This will change many files due to the semicolon and quote style preferences.
