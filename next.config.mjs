import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    output: 'export',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
    images: {
        unoptimized: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('pdfjs-dist');
        }
        config.resolve.alias.canvas = false;
        return config;
    },
};

export default withNextIntl(nextConfig);
