interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: "Is my data secure?",
    answer:
      "Yes. Fast Orbit runs 100% in your browser when you use the demo. Files are parsed locally and never uploaded. We cannot see, store or share your data.",
  },
  {
    question: "What does the weather demo show?",
    answer:
      "It fetches a 7-day forecast from Open-Meteo for 20 cities via TanStack Query, then renders the same data in a Chart and a Table. The location is a URL search param, so you can share ?location=tokyo.",
  },
  {
    question: "Do I need an API key for Open-Meteo?",
    answer:
      "No. Open-Meteo is free and requires no key. The demo uses Zod to validate the response before it hits the UI.",
  },
  {
    question: "Can I use this starter for my own data?",
    answer:
      "Yes. Copy the useWeather pattern, point it at your own API, and keep keepPreviousData so the UI does not jump.",
  },
  {
    question: "How does the site deploy?",
    answer:
      "pnpm build prerenders every route to static HTML. Cloudflare Pages serves dist/client with no edge compute. See #quick-start.",
  },
  {
    question: "Is Fast Orbit free to use?",
    answer: "Yes. Fast Orbit is MIT licensed. Clone, fork and ship — no watermark, no limits.",
  },
];
