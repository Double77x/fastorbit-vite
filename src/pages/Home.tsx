import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import QuickStartSection from "@/components/landing/QuickStartSection";
import StackSection from "@/components/landing/StackSection";
import { WeatherSection } from "@/components/weather/WeatherSection";
import FaqSection from "@/components/landing/FaqSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/Footer";
import { SEO } from "@/components/Seo";

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Fast Orbit runs 100% in your browser. Files are processed locally and never uploaded to a server. We cannot see, store or share your data.",
        },
      },
      {
        "@type": "Question",
        name: "What file formats can I upload?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CSV, JSON and Excel (.xlsx). Drag and drop a file onto the canvas or paste raw text into the data editor.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my charts for presentations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Export high-resolution PNGs for slides or SVGs for editing in tools such as Illustrator or Figma.",
        },
      },
    ],
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <SEO
        title='Fast Orbit | TanStack Start SSG starter on Cloudflare Pages'
        description='A barebones quick-start for TanStack Router, Query, Charts, Table and Virtual — type-safe, SSG-ready, and styled with Base UI + Tailwind. Clone and ship.'
        keywords={[
          "tanstack start",
          "tanstack query",
          "tanstack table",
          "tanstack charts",
          "tanstack virtual",
          "cloudflare pages",
          "ssg",
          "fast orbit",
        ]}
        schema={faqSchema}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <QuickStartSection />
        <StackSection />
        <WeatherSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
