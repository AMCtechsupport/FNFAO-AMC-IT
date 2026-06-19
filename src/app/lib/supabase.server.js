import "server-only";
import { createQueryClient } from "./query-builder.js";
import { executeQuery } from "./query-execute.js";
import { storage } from "./storage.js";

const dbClient = createQueryClient(executeQuery);

const supabase = {
  from(table) {
    return dbClient.from(table);
  },
  storage,
  channel(name) {
    return dbClient.channel(name);
  },
  auth: {
    async setSession() {
      return { data: { session: null }, error: null };
    },
  },
};

export default supabase;
