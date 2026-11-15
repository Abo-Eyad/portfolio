import { createFileRoute } from "@tanstack/react-router";
import { LangProvider } from "@/components/site/lang";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { About, Contact, Education, Experience, Footer, Projects, Skills, Tools } from "@/components/site/Sections";
import { content } from "@/content/portfolio";
import { HERO_FRAMES } from "@/components/site/hero-frames";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: content.en.metaTitle },
      { name: "description", content: content.en.metaDesc },
      { property: "og:title", content: content.en.metaTitle },
      { property: "og:description", content: content.en.metaDesc },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preload", as: "image", href: `${import.meta.env.BASE_URL}assets/videos/hero-poster.jpg` },
      { rel: "preload", as: "image", href: HERO_FRAMES[0] },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <LangProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Tools />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
    </LangProvider>
  );
}
