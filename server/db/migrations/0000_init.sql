CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "image" text,
  "google_sub" text UNIQUE,
  "terms_accepted_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "rabbit_holes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "seed_video_id" text NOT NULL,
  "status" text DEFAULT 'ready' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "rabbit_holes_user_updated_idx"
  ON "rabbit_holes" ("user_id", "updated_at" DESC);

CREATE TABLE IF NOT EXISTS "nodes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "rabbit_hole_id" uuid NOT NULL REFERENCES "rabbit_holes"("id") ON DELETE CASCADE,
  "video_id" text NOT NULL,
  "title" text NOT NULL,
  "channel_title" text,
  "thumb_url" text,
  "available" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "nodes_hole_video_uidx"
  ON "nodes" ("rabbit_hole_id", "video_id");
CREATE INDEX IF NOT EXISTS "nodes_rabbit_hole_idx"
  ON "nodes" ("rabbit_hole_id");

CREATE TABLE IF NOT EXISTS "edges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "rabbit_hole_id" uuid NOT NULL REFERENCES "rabbit_holes"("id") ON DELETE CASCADE,
  "from_node_id" uuid NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE,
  "to_node_id" uuid NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE,
  "phrase" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "edges_from_to_uidx"
  ON "edges" ("from_node_id", "to_node_id");
CREATE INDEX IF NOT EXISTS "edges_rabbit_hole_idx"
  ON "edges" ("rabbit_hole_id");

CREATE TABLE IF NOT EXISTS "path_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "rabbit_hole_id" uuid NOT NULL REFERENCES "rabbit_holes"("id") ON DELETE CASCADE,
  "node_id" uuid NOT NULL REFERENCES "nodes"("id") ON DELETE CASCADE,
  "kind" text DEFAULT 'visited' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "path_events_hole_created_idx"
  ON "path_events" ("rabbit_hole_id", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "path_events_hole_node_kind_uidx"
  ON "path_events" ("rabbit_hole_id", "node_id", "kind");

CREATE TABLE IF NOT EXISTS "expand_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rabbit_hole_id" uuid NOT NULL REFERENCES "rabbit_holes"("id") ON DELETE CASCADE,
  "node_id" uuid REFERENCES "nodes"("id") ON DELETE SET NULL,
  "status" text NOT NULL,
  "model" text,
  "prompt_tokens" integer,
  "completion_tokens" integer,
  "meta" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "expand_ledger_user_created_idx"
  ON "expand_ledger" ("user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "youtube_cache" (
  "video_id" text PRIMARY KEY NOT NULL,
  "related_payload" jsonb NOT NULL,
  "fetched_at" timestamptz DEFAULT now() NOT NULL
);
