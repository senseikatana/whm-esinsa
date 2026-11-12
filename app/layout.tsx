import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "WarehouseFlow SGA — ESINSA",
	description: "Sistema de Gestión de Almacén enterprise",
};

export const viewport: Viewport = {
	themeColor: "#050811",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
			<body className="min-h-full flex flex-col bg-[#050811] text-slate-100 antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
