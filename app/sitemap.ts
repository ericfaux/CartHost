import { MetadataRoute } from 'next'
// Once you create the blogData file later, you can uncomment this to generate dynamic posts
// import { blogPosts } from '@/lib/blogData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.carthost.app'

  // 1. Static Pages (Includes your new SEO pages)
  const routes = [
    '',                                     // Home
    '/login',
    '/signup',
    '/terms',
    '/privacy',
    '/tools/waiver-generator',              // Existing tool
    '/tools/battery-calculator',            // Existing tool
    '/resources/golf-cart-waiver-template', // <--- NEW: High Priority SEO Page
    '/blog',                                // <--- NEW: Blog Index
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : (route.includes('resources') ? 0.9 : 0.6),
  }))

  // 2. Future Dynamic Blog Posts
  // (Uncomment this block when your blogData.ts is fully ready)
  /*
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  */

  // Currently returning static routes only.
  // Change this to `return [...routes, ...blogRoutes]` later.
  return [...routes]
}
