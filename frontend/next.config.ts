/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false, // Derleme ikonunu gizle
    appIsrStatus: false,  // Statik/Dinamik durumunu gizle
  },
};

export default nextConfig;