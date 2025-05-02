/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://diplant.hu',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/profil/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: ['/admin', '/profil'],
      },
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  generateIndexSitemap: false,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
}