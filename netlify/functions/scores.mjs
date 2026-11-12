import { getStore } from "@netlify/blobs";
import { handle } from "./scores-core.mjs";

export default async (req) => {
  const store = getStore({ name: "deal-rush", consistency: "strong" });
  return handle(req, store, Netlify.env.get("ADMIN_KEY"));
};

export const config = { path: "/api/scores" };
