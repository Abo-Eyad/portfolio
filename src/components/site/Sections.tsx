import { useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "./lang";
import { emailAddress, links } from "@/content/portfolio";
import { Button } from "@/components/ui/button";

function SectionHead({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: string }) {
  return (
    <div className="mb-12 max-w-3xl md:mb-16">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
      {intro && <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">{intro}</p>}
    </div>
  );
}

function Section({ id, children, alt }: { id: string; children: ReactNode; alt?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-22 border-t border-border py-24 md:py-32 ${alt ? "bg-navy" : ""}`}>
      <div className="mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2">
      {tags.map((x) => (
        <li key={x} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{x}</li>
      ))}
    </ul>
  );
}

export function About() {
  const { t } = useLang();
  return (
    <Section id="about">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <div>
          <p className="eyebrow mb-4">{t.about.eyebrow}</p>
          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            {t.about.title[0]} <span className="text-primary">{t.about.title[1]}</span>
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-muted-foreground">{t.about.body}</p>
      </div>
    </Section>
  );
}

export function Skills() {
  const { t } = useLang();
  return (
    <Section id="skills" alt>
      <SectionHead eyebrow={t.skills.eyebrow} title={t.skills.title} intro={t.skills.intro} />
      <div className="grid gap-x-12 gap-y-7 md:grid-cols-2">
        {t.skills.list.map(([name, pct]) => (
          <div key={name}>
            <div className="mb-2 flex justify-between gap-4 text-sm">
              <span>{name}</span>
              <span className="font-display text-primary" dir="ltr">{pct}%</span>
            </div>
            <div className="h-px bg-border">
              <div className="h-px bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <h3 className="mt-20 mb-6 text-xl font-semibold">{t.skills.techTitle}</h3>
      <ul className="flex flex-wrap gap-2" dir="ltr">
        {t.skills.tech.map((x) => (
          <li key={x} className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-sm text-muted-foreground">{x}</li>
        ))}
      </ul>
    </Section>
  );
}

export function Tools() {
  const { t } = useLang();
  return (
    <Section id="tools">
      <SectionHead eyebrow={t.tools.eyebrow} title={t.tools.title} intro={t.tools.intro} />
      <p className="mb-8 font-display text-sm text-primary">{t.tools.tagline}</p>
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
        {t.tools.list.map((tool, i) => (
          <article key={tool.name} className="bg-background p-8 md:p-10">
            <p className="font-display text-xs text-muted-foreground" dir="ltr">0{i + 1}</p>
            <h3 className="mt-3 text-2xl font-semibold" dir="ltr">{tool.name}</h3>
            <p className="mt-1 text-sm text-primary">{tool.meta}</p>
            <p className="mt-5 leading-relaxed text-muted-foreground">{tool.body}</p>
            <Tags tags={tool.tags} />
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Experience() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const job = t.experience.jobs[active] ?? t.experience.jobs[0];
  if (!job) return null;
  return (
    <Section id="experience" alt>
      <SectionHead eyebrow={t.experience.eyebrow} title={t.experience.title} intro={t.experience.intro} />
      <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">{t.experience.hint}</p>
      <div className="grid gap-8 md:grid-cols-[280px_1fr] md:gap-12">
        <ol role="tablist" className="relative flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-0 md:overflow-visible md:border-s md:border-border md:pb-0">
          {t.experience.jobs.map((j, i) => {
            const on = i === active;
            return (
              <li key={i} className="shrink-0">
                 <Button variant="ghost"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                   className={`relative block h-auto w-full whitespace-normal rounded-lg border px-4 py-3 text-start hover:bg-background md:rounded-none md:border-0 md:px-6 md:py-4 ${on ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  <span className={`absolute -start-[5px] top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full border md:block ${on ? "border-primary bg-primary" : "border-muted-foreground bg-navy"}`} />
                  <span className={`block font-display text-lg ${on ? "text-primary" : ""}`}><bdi>{j.year}</bdi></span>
                  <span className="block text-sm"><bdi>{j.company}</bdi></span>
                 </Button>
              </li>
            );
          })}
        </ol>
        <article key={active} className="animate-in fade-in slide-in-from-bottom-2 self-start rounded-xl border border-border bg-background p-7 duration-300 md:p-10">
          <p className="font-display text-sm text-primary">{job.period}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-snug md:text-3xl">{job.role}</h3>
          <p className="mt-2 font-medium"><bdi>{job.company}</bdi></p>
          <p className="mt-1 text-sm text-muted-foreground">{job.place}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{job.body}</p>
          <Tags tags={job.tags} />
        </article>
      </div>
      <ul className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-8" dir="ltr">
        {t.experience.companies.map((c) => (
          <li key={c} className="font-display text-sm text-muted-foreground">{c}</li>
        ))}
      </ul>
    </Section>
  );
}

export function Projects() {
  const { t } = useLang();
  return (
    <Section id="projects">
      <SectionHead eyebrow={t.projects.eyebrow} title={t.projects.title} intro={t.projects.intro} />
      <div className="divide-y divide-border border-y border-border">
        {t.projects.list.map((p, i) => (
          <article key={p.name} className="grid gap-3 py-8 md:grid-cols-[60px_1fr_1.2fr] md:gap-8">
            <span className="font-display text-sm text-primary" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.place}</p>
            </div>
            <div>
              <p className="leading-relaxed text-muted-foreground">{p.body}</p>
              <Tags tags={p.tags} />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Education() {
  const { t } = useLang();
  const e = t.education;
  return (
    <Section id="education" alt>
      <SectionHead eyebrow={e.eyebrow} title={e.title} intro={e.intro} />
      <div className="grid gap-6 md:grid-cols-2">
        {e.degrees.map((d) => (
          <article key={d.title} className="rounded-xl border border-border bg-background p-7">
            <p className="font-display text-sm text-primary" dir="ltr">{d.period}</p>
            <h3 className="mt-3 text-xl font-semibold">{d.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
            <p className="mt-4 text-sm text-achievement">{d.note}</p>
          </article>
        ))}
      </div>
      <div className="mt-14 grid gap-12 md:grid-cols-3">
        <div>
          <h3 className="mb-5 text-lg font-semibold">{e.languagesTitle}</h3>
          <ul className="space-y-4">
            {e.languages.map(([l, d, lvl]) => (
              <li key={l} className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div><p>{l}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                <span className="text-xs text-primary">{lvl}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-lg font-semibold">{e.coursesTitle}</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">{e.courses.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div>
          <h3 className="mb-5 text-lg font-semibold">{e.trainingTitle}</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">{e.training.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}

export function Contact() {
  const { t } = useLang();
  const c = t.contact;
  const [email, setEmail] = useState<string | null>(null);
  const rows: { label: string; value: string; href?: string; ltr?: boolean }[] = [
    { label: c.phone, value: "+20 114 009 6690", href: links.phone, ltr: true },
    { label: c.location, value: c.locationValue },
    { label: "LinkedIn", value: "/in/eng-ahmed-abd-elwahab", href: links.linkedin, ltr: true },
    { label: "GitHub", value: "github.com/abo-eyad", href: links.github, ltr: true },
    { label: "YouTube", value: "@Ahmed.Wahab.INFRABIM", href: links.youtube, ltr: true },
    { label: "Gumroad", value: "mawengineer.gumroad.com", href: links.gumroad, ltr: true },
    { label: "civil3d.si", value: "civil3d.si", href: links.civil3d, ltr: true },
    { label: c.cv, value: c.cvValue, href: links.cv },
  ];
  return (
    <Section id="contact">
      <SectionHead eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
      <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        <li className="bg-background p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.email}</p>
          {email ? (
            <a href={`mailto:${email}`} className="mt-2 block break-all text-primary" dir="ltr">{email}</a>
          ) : (
            <Button variant="link" onClick={() => setEmail(emailAddress())} className="mt-2 h-auto justify-start p-0 text-link">{c.reveal}</Button>
          )}
        </li>
        {rows.map((r) => (
          <li key={r.label} className="bg-background p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{r.label}</p>
            {r.href ? (
              <a href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group mt-2 inline-flex items-center gap-1 break-all text-foreground hover:text-primary" dir={r.ltr ? "ltr" : undefined}>
                {r.value} <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100" />
              </a>
            ) : (
              <p className="mt-2">{r.value}</p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto max-w-6xl px-5 text-sm text-muted-foreground">
        {t.footer[0]} <span className="text-foreground">{t.footer[1]}</span> · © 2026
      </div>
    </footer>
  );
}
