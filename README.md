# Daily Trends Service

## Description

This is a service that scrapes the latest news from a given source and stores it in a mongodb database.

## Technologies

- Node.js
- TypeScript
- Express
- Mongoose

## Architecture

![Architecture](./readme-assets/architecture-model.png)

## Domain Model

![Domain](./readme-assets/domain-model.png)

## Installation

```bash
docker compose up -d
```

## Testing
```bash
pnpm test
```

## Testing with coverage
```bash
pnpm test:coverage
```
