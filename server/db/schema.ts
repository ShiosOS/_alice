import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { holeStatuses, ledgerStatuses, pathKinds } from '../../shared/types/rabbit-holes'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  googleSub: text('google_sub').unique(),
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const rabbitHoles = pgTable(
  'rabbit_holes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    seedVideoId: text('seed_video_id').notNull(),
    status: text('status', { enum: holeStatuses }).notNull().default('ready'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  t => [
    index('rabbit_holes_user_updated_idx').on(t.userId, t.updatedAt),
  ],
)

export const nodes = pgTable(
  'nodes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rabbitHoleId: uuid('rabbit_hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    videoId: text('video_id').notNull(),
    title: text('title').notNull(),
    channelTitle: text('channel_title'),
    thumbUrl: text('thumb_url'),
    available: boolean('available').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  t => [
    uniqueIndex('nodes_hole_video_uidx').on(t.rabbitHoleId, t.videoId),
    index('nodes_rabbit_hole_idx').on(t.rabbitHoleId),
  ],
)

export const edges = pgTable(
  'edges',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rabbitHoleId: uuid('rabbit_hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    fromNodeId: uuid('from_node_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    toNodeId: uuid('to_node_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    phrase: text('phrase').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  t => [
    uniqueIndex('edges_from_to_uidx').on(t.fromNodeId, t.toNodeId),
    index('edges_rabbit_hole_idx').on(t.rabbitHoleId),
  ],
)

export const pathEvents = pgTable(
  'path_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rabbitHoleId: uuid('rabbit_hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    nodeId: uuid('node_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: pathKinds }).notNull().default('visited'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  t => [
    index('path_events_hole_created_idx').on(t.rabbitHoleId, t.createdAt),
    uniqueIndex('path_events_hole_node_kind_uidx').on(t.rabbitHoleId, t.nodeId, t.kind),
  ],
)

export const expandLedger = pgTable(
  'expand_ledger',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rabbitHoleId: uuid('rabbit_hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    nodeId: uuid('node_id').references(() => nodes.id, { onDelete: 'set null' }),
    status: text('status', { enum: ledgerStatuses }).notNull(),
    model: text('model'),
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  t => [index('expand_ledger_user_created_idx').on(t.userId, t.createdAt)],
)

export const youtubeCache = pgTable('youtube_cache', {
  videoId: text('video_id').primaryKey(),
  relatedPayload: jsonb('related_payload').$type<unknown>().notNull(),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
})
