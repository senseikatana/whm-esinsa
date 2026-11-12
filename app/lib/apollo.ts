"use client";

import { InMemoryCache } from "@apollo/client/cache";
import { ApolloClient } from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";
import { withBasePath } from "./base-path";

const httpLink = new HttpLink({
	uri: withBasePath("/api/graphql"),
});

export const apolloClient = new ApolloClient({
	link: httpLink,
	cache: new InMemoryCache(),
	defaultOptions: {
		query: {
			fetchPolicy: "network-only",
		},
	},
});
