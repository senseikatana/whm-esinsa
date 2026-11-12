import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	// `pg` opens TCP sockets; keep it out of the bundler and in Node.
	serverExternalPackages: ["pg"],
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains",
					},
				],
			},
		];
	},
};

export default nextConfig;
