import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    storageId: v.id("_storage"),
    memoryId: v.string(),
    userId: v.string(),
  })
    .index("by_memoryId", ["memoryId"])
    .index("by_userId", ["userId"]),
});
