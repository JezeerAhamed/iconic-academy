import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ICONIC ACADEMY – AI-Powered A/L Learning',
        short_name: 'Iconic',
        description: "Sri Lanka's most advanced A/L learning platform with AI tutoring.",
        start_url: '/',
        display: 'standalone',
        background_color: '#080c14',
        theme_color: '#080c14',
        icons: [
            {
                src: '/favicon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
