import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

/**
 * HTTP action to serve files from Convex storage.
 * Usage: GET /getFile?storageId=<storageId>
 */
http.route({
    path: "/getFile",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const storageId = url.searchParams.get("storageId");

        if (!storageId) {
            return new Response("Missing storageId parameter", { status: 400 });
        }

        const blob = await ctx.storage.get(storageId as Id<"_storage">);
        if (!blob) {
            return new Response("File not found", { status: 404 });
        }

        return new Response(blob, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=31536000",
            },
        });
    }),
});

// CORS preflight
http.route({
    path: "/getFile",
    method: "OPTIONS",
    handler: httpAction(async () => {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }),
});

export default http;
