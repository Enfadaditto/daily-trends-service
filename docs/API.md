# API Reference

Base URL: `http://localhost:3080`

## GET /scrape

Trigger scraping for a given news source and upsert latest feeds.

Query params:
- `source` (required): `el_pais` | `el_mundo` (only `el_pais` implemented)
- `limit` (optional, number): defaults to `5`

Responses:
- 200: `{ true | false }` → `true` when at least one feed was upserted
- 400: `{ message: "Invalid source. Use one of: el_pais, el_mundo" }`
- 422: `{ message: "Source <value> not supported yet" }`
- 500: `{ message: "Scrape failed" }`

Example:
```bash
curl "http://localhost:3080/scrape?source=el_pais&limit=5"
```

---

## GET /list

List feeds with optional filters. Returns a minimal projection.

Query params:
- `filters` (JSON string). Shape:
  - `title?: string`
  - `limit?: number`
  - `source?: "el_pais" | "el_mundo"`
  - `from?: string (ISO date)`
  - `to?: string (ISO date)`

Response 200:
```json
[
  { "title": "string", "url": "https://...", "publishedAt": "2024-01-01T00:00:00.000Z" }
]
```

Errors:
- 500: `{ message: "List feeds failed" }`

Examples:
```bash
curl "http://localhost:3080/list?filters={"premium":false}"
```

---

## GET /detailed-feed

Get the full details of a single feed by `url`.

Query params:
- `url` (required): absolute URL of the feed article

Response 200: Full feed entity
```json
{
  "title": "string",
  "description": "string",
  "author": "string",
  "source": "el_pais",
  "mainTopic": "string",
  "url": "https://...",
  "premium": false,
  "location": "string | null",
  "media": ["https://..."],
  "subTopics": ["string"],
  "relatedFeeds": ["https://..."],
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

Errors:
- 400: `{ message: "URL is required" }`
- 500: `{ message: "Detailed feed failed" }`

Example:
```bash
curl "http://localhost:3080/detailed-feed?url=https://elpais.com/sociedad/2025-10-07/decenas-de-mujeres-se-unen-para-llevar-a-la-justicia-el-escandalo-de-las-mamografias-nadie-las-habia-escuchado.html"
```
