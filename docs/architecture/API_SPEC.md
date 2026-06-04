# API and Server Action Spec

## 1. Auth

- Provider: Supabase Auth (email/password)
- Admin-only operations require authenticated session.
- Public operations expose read-only published data.

## 2. Public Read Contracts

### `GET /api/categories`

- Returns active categories ordered by `display_order`.
- Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "soup",
      "name_km": "ស៊ុប",
      "cover_image_url": "https://...",
      "display_order": 1
    }
  ]
}
```

### `GET /api/recipes?categoryId=<uuid>`

- Returns published recipes filtered by category.

### `GET /api/recipes/:id`

- Returns a single published recipe detail.

## 3. Admin Write Contracts

### `POST /api/admin/recipes`

- Request:

```json
{
  "title_km": "string",
  "thumbnail_url": "https://...",
  "category_id": "uuid",
  "youtube_url": "https://youtube.com/watch?v=...",
  "duration_minutes": 20,
  "is_published": true
}
```

- Behavior:
  - Validate required fields.
  - Parse `youtube_video_id` from `youtube_url`.
  - Persist recipe and return created object.

### `PUT /api/admin/recipes/:id`

- Same request schema as create.
- Updates recipe by `id`.

### `DELETE /api/admin/recipes/:id`

- Hard delete or soft delete by policy (MVP default: hard delete).

## 4. Validation Rules

- `title_km`: non-empty string, max 120 chars
- `thumbnail_url`: valid URL
- `youtube_url`: valid YouTube URL only
- `duration_minutes`: integer `>= 1`, optional
- `category_id`: valid existing category UUID

## 5. Error Contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid youtube_url",
    "fields": {
      "youtube_url": "Must be a valid YouTube link"
    }
  }
}
```

## 6. Status Codes

- `200`: read/update success
- `201`: create success
- `204`: delete success
- `400`: validation error
- `401`: unauthenticated
- `403`: unauthorized
- `404`: not found
- `500`: unexpected server error
