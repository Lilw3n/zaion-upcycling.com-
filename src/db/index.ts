import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ensureAuthSchema, ensureCatalog } from "./ensure";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL manquant");
}

const real = drizzle(neon(url), { schema });

function ready() {
  return Promise.all([ensureCatalog(), ensureAuthSchema()]);
}

function gate<T extends object>(value: T): T {
  return new Proxy(value, {
    get(target, prop, receiver) {
      if (prop === "then") {
        const then = Reflect.get(target, prop, receiver);
        if (typeof then !== "function") return undefined;
        return (resolve: (result: unknown) => unknown, reject: (error: unknown) => unknown) =>
          ready().then(() => then.call(target, resolve, reject), reject);
      }
      const child = Reflect.get(target, prop, receiver);
      if (typeof child === "function") {
        return (...args: unknown[]) => {
          const next = child.apply(target, args);
          return next && typeof next === "object" ? gate(next) : next;
        };
      }
      return child;
    },
  });
}

export const db = gate(real);
