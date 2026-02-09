import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a short-lived upload URL for the client to POST a file to.
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * After uploading, save the storageId linked to a memoryId and userId.
 */
export const saveFile = mutation({
    args: {
        storageId: v.id("_storage"),
        memoryId: v.string(),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("files", {
            storageId: args.storageId,
            memoryId: args.memoryId,
            userId: args.userId,
        });
    },
});

/**
 * Get the serving URL for a file by its storageId.
 */
export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

/**
 * Delete a file from storage by memoryId.
 */
export const deleteFileByMemoryId = mutation({
    args: { memoryId: v.string() },
    handler: async (ctx, args) => {
        const file = await ctx.db
            .query("files")
            .withIndex("by_memoryId", (q) => q.eq("memoryId", args.memoryId))
            .first();
        if (file) {
            await ctx.storage.delete(file.storageId);
            await ctx.db.delete(file._id);
        }
    },
});
