import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

const server = new ApolloServer({
	typeDefs,
	resolvers,
	introspection: true,
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: Request) {
	return handler(request);
}

export async function POST(request: Request) {
	return handler(request);
}
