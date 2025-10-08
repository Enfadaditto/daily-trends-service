# Architecture

This service follows a layered, domain-centric architecture.

![Architecture](../readme-assets/architecture-model.png)

## Layers

- Domain (`src/domain`)
  - Entities and value objects (`FeedEntity`, `SourceVO`, `UrlVO`, `TopicVO`)
  - Ports (`FeedRepository`, `ScraperPort`)
- Application (`src/application`)
  - Use-cases (`ScrapeLatestNews`, `ListFeeds`, `DetailedFeed`)
- Infrastructure (`src/infrastructure`)
  - Persistence adapter (Mongo) and mappers
  - Scraper adapter (`ElPaisScraper`)
  - API server (Express wrapper)
- HTTP (`src/http`)
  - Controllers wiring use-cases to routes

## Request flow

1. HTTP controller receives request via `ExpressHttpServer`.
2. Controller validates/parses inputs and invokes a use-case.
3. Use-case collaborates with domain ports (e.g., repository, scraper).
4. Infrastructure adapters implement those ports (Mongo, scrapers).
5. Response is serialized and returned.

## Data model

![Domain](../readme-assets/domain-model.png)

- Persistence model lives in `infrastructure/adapters/persistence/mongo/models/feed.schema.ts`.
- `FeedEntity` exposes `.toPrimitive()` for API responses.

## Testing

- Unit tests in `tests/unit/**` target use-cases, controllers, and domain.
- Integration tests in `tests/integration/**` can exercise adapters.
- Coverage output is configured in `vitest.config.ts`.
