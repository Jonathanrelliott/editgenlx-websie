/** @type {import('next').NextConfig} */
const r2Patterns = [];

if (process.env.NEXT_PUBLIC_R2_URL) {
	try {
		const r2Url = new URL(process.env.NEXT_PUBLIC_R2_URL);
		r2Patterns.push({
			protocol: r2Url.protocol.replace(':', ''),
			hostname: r2Url.hostname,
			pathname: '/**',
		});
	} catch {
		// Ignore invalid env URL; wildcard R2 pattern below still covers common hosts.
	}
}

const nextConfig = {
	images: {
		formats: ['image/avif', 'image/webp'],
		remotePatterns: [
			{ protocol: 'https', hostname: '**.r2.dev', pathname: '/**' },
			...r2Patterns,
		],
	},
};

export default nextConfig;
