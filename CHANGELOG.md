# Changelog

## 2.0.2

- Add package exports map so native Node ESM resolves named exports correctly

## 2.0.1

- Publish TypeScript type definitions (`types` field in `package.json`)

## 2.0.0

- Rewrite library in TypeScript
- Use named exports (`import { erroz, AbstractError } from "erroz"`) instead of CommonJS default export

## 1.1.0

- `.toJSend()` determine status from status-code #4
- Error constructor accepts strings, which overwrite the error message (https://github.com/peerigon/erroz#throwing-with-error-message)
