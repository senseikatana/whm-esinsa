import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getSessionUser, withAuth } from "../../lib/api-auth";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

const server = new ApolloServer({
	typeDefs,
	resolvers,
	introspection: process.env.NODE_ENV !== "production",
});

// Bun keeps two module identities for @apollo/server (direct dep + .store copy),
// so the private `internals` type differs even though the runtime is the same.
const handler = startServerAndCreateNextHandler(server, {
	context: async () => ({ user: await getSessionUser() }),
});

export const GET = withAuth(async (request) => handler(request));
export const POST = withAuth(async (request) => handler(request));
