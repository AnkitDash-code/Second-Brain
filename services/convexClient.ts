import { ConvexReactClient } from "convex/react";

const convexUrl = (import.meta as any).env?.VITE_CONVEX_URL as string;

if (!convexUrl) {
    console.error(
        "VITE_CONVEX_URL is not set. Run `npx convex dev` to initialize your Convex project."
    );
}

export const convex = new ConvexReactClient(convexUrl || "");
