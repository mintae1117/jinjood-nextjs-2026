import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/cart", "/checkout", "/auth/"],
    },
    sitemap: "https://jinjood.com/sitemap.xml",
  };
}
