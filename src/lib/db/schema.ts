import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const divarSessions = sqliteTable("divar_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull(),
  accessToken: text("access_token").notNull(),
  frontToken: text("front_token"),
  did: text("did"),
  csid: text("csid"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const postsCache = sqliteTable("posts_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").references(() => divarSessions.id),
  postToken: text("post_token").notNull(),
  manageToken: text("manage_token"),
  brandToken: text("brand_token"),
  title: text("title"),
  priceText: text("price_text"),
  status: text("status"),
  labelColor: text("label_color"),
  imageUrl: text("image_url"),
  imageCount: integer("image_count").default(0),
  location: text("location"),
  publishedAt: text("published_at"),
  expiresAt: text("expires_at"),
  rawJson: text("raw_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const postStats = sqliteTable("post_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postToken: text("post_token").notNull(),
  brandToken: text("brand_token").notNull(),
  impressions: integer("impressions").default(0),
  views: integer("views").default(0),
  contacts: integer("contacts").default(0),
  bookmarks: integer("bookmarks").default(0),
  chats: integer("chats").default(0),
  position: integer("position"),
  category: text("category"),
  city: text("city"),
  fetchedAt: integer("fetched_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const aiGenerations = sqliteTable("ai_generations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postToken: text("post_token"),
  type: text("type").notNull(), // title | description | image_prompt | analysis
  inputPrompt: text("input_prompt"),
  output: text("output").notNull(),
  model: text("model"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export type DivarSession = typeof divarSessions.$inferSelect;
export type NewDivarSession = typeof divarSessions.$inferInsert;
export type PostCache = typeof postsCache.$inferSelect;
export type NewPostCache = typeof postsCache.$inferInsert;
export type PostStat = typeof postStats.$inferSelect;
export type NewPostStat = typeof postStats.$inferInsert;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type NewAiGeneration = typeof aiGenerations.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;
