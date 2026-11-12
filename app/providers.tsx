"use client";

import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";
import { apolloClient } from "./lib/apollo";
import { AuthProvider } from "./lib/auth-context";

export default function Providers({ children }: { children: ReactNode }) {
	return (
		<ApolloProvider client={apolloClient}>
			<AuthProvider>{children}</AuthProvider>
		</ApolloProvider>
	);
}
