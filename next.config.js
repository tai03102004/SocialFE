/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
    webpack: (config) => {
        // ✅ Mock AsyncStorage cho MetaMask SDK (web environment)
        config.resolve.alias['@react-native-async-storage/async-storage'] = path.resolve(
            __dirname,
            'mocks/asyncStorageMock.js'
        );
        return config;
    },
};

module.exports = nextConfig;