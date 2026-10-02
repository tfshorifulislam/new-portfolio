import nextDynamic from "next/dynamic";
import {
  getProfile,
  getProjects,
  getExperiences,
  getSkills,
  getServices,
  getSocialLinks,
  getFundingLinks,
  getContactEmail,
  getRandomTagline,
  getContributionCalendar,
} from "@/content";
import { Hero } from "@/components/home/Hero";
import { SiteNav } from "@/components/navbar/SiteNav";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 43200;

const About = nextDynamic(() =>
  import("@/components/home/About").then((m) => ({ default: m.About })),
);
const GithubContributions = nextDynamic(() =>
  import("@/components/home/GithubContributions").then((m) => ({ default: m.GithubContributions })),
);
const Skills = nextDynamic(() =>
  import("@/components/home/Skills").then((m) => ({ default: m.Skills })),
);
const Experience = nextDynamic(() =>
  import("@/components/home/Experience").then((m) => ({ default: m.Experience })),
);
const Projects = nextDynamic(() =>
  import("@/components/home/Projects").then((m) => ({ default: m.Projects })),
);
const Services = nextDynamic(() =>
  import("@/components/home/Services").then((m) => ({ default: m.Services })),
);

const Contact = nextDynamic(() =>
  import("@/components/home/Contact").then((m) => ({ default: m.Contact })),
);
const Faq = nextDynamic(() =>
  import("@/components/sections/FaqSection").then((m) => ({ default: m.FaqSection })),
);
export default async function Home() {
  const [
    profile,
    projects,
    experiences,
    skills,
    services,
    socials,
    funding,
    tagline,
    contactEmail,
    contributions,
  ] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperiences(),
    getSkills(),
    getServices(),
    getSocialLinks(),
    getFundingLinks(),
    getRandomTagline(),
    getContactEmail(),
    getContributionCalendar(),
  ]);

  const sponsorUrl = funding.find((f) => f.primary)?.url;

  return (
    <div className="max-w-[1920px] mx-auto">
      <SiteNav
        tagline={tagline}
        socials={socials.map((s) => ({ platform: s.platform, url: s.url }))}
      />

      <Hero
        profile={{ name: profile.name, roles: profile.roles }}
        sponsorUrl={sponsorUrl}
        heroTagline={profile.heroTagline}
      />

      <About
        profile={{
          bio: profile.bio,
          stats: profile.stats,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        }}
      />


      <Skills skills={skills} />

      <Experience experiences={experiences} />

      <Projects projects={projects} />

      <Services services={services} />

      <Faq />

      <GithubContributions calendar={contributions} />
      
      <Contact socials={socials} email={contactEmail} />

      <Footer socials={socials} />
    </div>
  );
}
