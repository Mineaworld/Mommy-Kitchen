# ERD: Core Data Model

## Mermaid ER Diagram

```mermaid
erDiagram
    CATEGORIES ||--o{ RECIPES : contains
    RECIPES ||--o{ ANALYTICS_EVENTS : tracked_by

    CATEGORIES {
      uuid id PK
      text slug UK
      text name_km
      text cover_image_url
      int display_order
      bool is_active
      timestamptz created_at
      timestamptz updated_at
    }

    RECIPES {
      uuid id PK
      text title_km
      text thumbnail_url
      uuid category_id FK
      text youtube_url
      text youtube_video_id
      int duration_minutes
      bool is_published
      timestamptz created_at
      timestamptz updated_at
    }

    AUDIO_LABELS {
      text key PK
      text audio_url
      timestamptz updated_at
    }

    ANALYTICS_EVENTS {
      uuid id PK
      text event_name
      uuid recipe_id FK
      uuid category_id FK
      text device_type
      timestamptz created_at
    }
```

## Table Details

### `categories`

- Purpose: Recipe grouping for visual navigation
- Constraints:
  - `slug` unique
  - `display_order` sortable
  - inactive categories hidden on public UI

### `recipes`

- Purpose: Public recipe catalog and playback metadata
- Constraints:
  - `title_km`, `thumbnail_url`, `youtube_url`, `category_id` required
  - `youtube_video_id` derived from `youtube_url`
  - `is_published = false` hides recipe publicly
- Indexes:
  - `(category_id, is_published)`
  - `youtube_video_id`

### `audio_labels`

- Purpose: recorded Khmer fallback audio for key UI actions
- Keys example:
  - `open_video`
  - `back_home`
  - `network_error`

### `analytics_events` (optional lightweight internal tracking)

- Purpose: privacy-safe usage stats for improvement
- Event examples:
  - `category_opened`
  - `recipe_opened`
  - `video_play_attempted`
