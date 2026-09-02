export const siteConfig = {
  name: "Fast Orbit",
  url: "https://fastorbit.danread.gq",
  description:
    "Turn your CSV, JSON, and Excel files into beautiful, publication-ready charts directly in your browser. Secure, client-side, and free.",
  author: "Dan Read",
  email: "danreaduk@proton.me",
  links: {
    github: "https://github.com/Double77x/fastorbit-vite",
    twitter: "https://twitter.com/",
  },
  nav: [
    { label: "Graph", href: "/graph" },
    { label: "Make SVG", href: "/make-svg" },
  ] as const,
} as const;
