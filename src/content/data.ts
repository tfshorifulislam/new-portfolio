import type {
  Experience,
  Faq,
  FundingLink,
  Profile,
  Project,
  Service,
  Skill,
  SocialLink,
} from "./types";

export const profile: Profile = {
  name: "Shoriful Islam",
  bio: "I'm a Full Stack Web Developer focused on building modern, responsive, and reliable web applications. I work with React, Next.js, TypeScript, Node.js, Express, PostgreSQL, MongoDB, Prisma, and Redis to build complete frontend and backend solutions.\n\nI enjoy turning ideas into practical products, learning new technologies, and writing clean, maintainable code. I'm especially interested in building user-friendly applications with a strong focus on performance, security, and real-world usability.",
  roles: [
    "Full Stack Web Developer",
    "Frontend Developer",
    "Backend Developer",
    "Software Engineer",
  ],
  avatarUrl: "/images/shoriful.png",
  heroTagline: "Building ideas into real products.",
  stats: {
    years: 1,
    repos: 0,
    stars: 0,
    followers: 0,
  },
};

export const taglines = [
  "Build. Learn. Improve.",
  "Turning ideas into real products.",
  "Code with purpose.",
  "Building for the real world.",
];

export const projects: Project[] = [
  {
    id: "book-hand",
    repo: "Book-Hand",
    title: "BookHand",
    customBlurb: "A student marketplace for buying and selling used university textbooks.",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Prisma", "Redis"],
    featured: true,
    order: 0,
    coverImage: "/images/bookHand.png",
    screenshots: [],
    githubUrl: "https://github.com/tfshorifulislam/Book-Hand",
    liveUrl: "https://book-hand.vercel.app/",
  },

  {
    id: "story-hub",
    repo: "StoryHub",
    title: "StoryHub",
    customBlurb:
      "A modern social publishing platform for creating, sharing, and discovering stories.",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"],
    featured: true,
    order: 1,
    coverImage: "/images/storyHub.png",
    screenshots: [],
    githubUrl: "https://github.com/tfshorifulislam/StoryHub",
    liveUrl: "https://storyhub-iota.vercel.app/",
  },

  {
    id: "homez",
    repo: "homez-client",
    title: "Homez",
    customBlurb: "A modern real estate platform for discovering and exploring properties.",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "MongoDB"],
    featured: true,
    order: 2,
    coverImage: "/images/homez.png",
    screenshots: [],
    githubUrl: "https://github.com/tfshorifulislam/homez-client",
    liveUrl: "https://homez-two.vercel.app/",
  },

  {
    id: "ugenai",
    repo: "ugenAI",
    title: "ugenAI",
    customBlurb:
      "An AI-powered web application built to provide practical AI features through a modern interface.",
    tags: ["Next.js", "React", "TypeScript", "AI"],
    featured: true,
    order: 3,
    coverImage: "/images/ugenAI.png",
    screenshots: [],
    githubUrl: "https://github.com/tfshorifulislam/ugenAI",
    liveUrl: "https://ugenai.vercel.app/",
  },
];

export const experiences: Experience[] = [
  {
    id: "webq",
    role: "Full Stack Developer Intern",
    org: "WebQ LTD",
    period: "Oct 2026 – Present",
    location: "Bangladesh",
    isCurrent: true,
    description: [
      "Working on modern web applications as part of the Software Engineering & Development Team.",
      "Contributing to frontend and backend development using modern web technologies.",
      "Learning and applying real-world software development practices in a professional environment.",
      "Collaborating with team members to build reliable and maintainable web solutions.",
    ],
    order: 0,
  },
  {
    id: "DesignSoulHub",
    role: "UI UX Designer",
    org: "Design Soul Hub",
    period: "mar 2025 – dec 2025",
    location: "Bangladesh",
    isCurrent: false,
    description: [
      "Designed modern and user-friendly web interfaces with a strong focus on usability and visual consistency.",
      "Created wireframes, user flows, and high-fidelity UI designs based on project requirements.",
      "Collaborated with developers to translate design concepts into responsive and polished web experiences.",
      "Improved user experience by focusing on intuitive navigation, clear layouts, and consistent design systems.",
    ],
    order: 1,
  },
];

const skillGroups: {
  category: string;
  items: { name: string; iconPath: string }[];
}[] = [
  {
    category: "Programming Languages",
    items: [
      { name: "JavaScript", iconPath: "/skills/javascript.svg" },
      { name: "TypeScript", iconPath: "/skills/typescript.svg" },
    ],
  },
  {
    category: "Frontend Development",
    items: [
      { name: "Next.js", iconPath: "/skills/nextjs.png" },
      { name: "React.js", iconPath: "/skills/react.png" },
      { name: "HTML", iconPath: "/skills/html.svg" },
      { name: "CSS", iconPath: "/skills/css.svg" },
      { name: "Tailwind CSS", iconPath: "/skills/tailwind.svg" },
      { name: "Redux Toolkit", iconPath: "/skills/redux.svg" },
    ],
  },
  {
    category: "Backend Development",
    items: [
      { name: "Node.js", iconPath: "/skills/nodejs.svg" },
      { name: "Express.js", iconPath: "/skills/express.png" },
      { name: "NestJS", iconPath: "/skills/nestjs.png" },
      { name: "REST API", iconPath: "/skills/nodejs.svg" },
    ],
  },
  {
    category: "Database & ORM",
    items: [
      { name: "PostgreSQL", iconPath: "/skills/postgresql.svg" },
      { name: "MongoDB", iconPath: "/skills/mongodb.png" },
      { name: "Prisma", iconPath: "/skills/prisma.svg" },
      { name: "Redis", iconPath: "/skills/redis.svg" },
    ],
  },
  {
    category: "Tools & Technologies",
    items: [
      { name: "Git", iconPath: "/skills/git.svg" },
      { name: "GitHub", iconPath: "/skills/github.png" },
      { name: "Docker", iconPath: "/skills/docker.png" },
      { name: "Stripe", iconPath: "/skills/stripe.svg" },
    ],
  },
  {
    category: "Other",
    items: [
      {
        name: "Problem Solving",
        iconPath: "/images/logical-thinking.png",
      },
      {
        name: "Clean Architecture",
        iconPath: "/images/logical-thinking.png",
      },
    ],
  },
];

export const skills: Skill[] = skillGroups.flatMap((group, groupIndex) =>
  group.items.map((item, itemIndex) => ({
    name: item.name,
    iconPath: item.iconPath,
    category: group.category,
    order: groupIndex * 100 + itemIndex,
  })),
);

export const services: Service[] = [
  {
    title: "Web Development",
    shortDescription: "I build modern, responsive, and user-friendly web applications.",
    description:
      "I build modern web applications using React, Next.js, TypeScript, and other modern technologies. I focus on responsive interfaces, clean code, performance, and a smooth user experience.",
    icon: null,
    order: 0,
  },
  {
    title: "Full Stack Development",
    shortDescription: "I develop complete frontend and backend solutions.",
    description:
      "I develop complete web solutions from frontend interfaces to backend APIs and databases. My focus is on building maintainable architectures that are reliable, secure, and ready to scale.",
    icon: null,
    order: 1,
  },
  {
    title: "Backend Development",
    shortDescription: "I build secure and maintainable backend APIs.",
    description:
      "I create backend services and REST APIs using Node.js and Express, with PostgreSQL or MongoDB for data management. I focus on authentication, security, performance, and clean architecture.",
    icon: null,
    order: 2,
  },
  {
    title: "UI/UX Design",
    shortDescription: "I design clean, intuitive, and user-friendly digital experiences.",
    description:
      "I design modern and user-friendly interfaces with a strong focus on usability, visual consistency, and responsive experiences. I work on user flows, wireframes, layouts, and high-fidelity designs that make products simple and enjoyable to use.",
    icon: null,
    order: 3,
  },
  {
    title: "UI Implementation",
    shortDescription: "I turn designs into responsive and polished interfaces.",
    description:
      "I transform designs and ideas into responsive web interfaces using React, Next.js, TypeScript, and Tailwind CSS while keeping the implementation clean and accessible.",
    icon: null,
    order: 4,
  },
];

export const socialLinks: SocialLink[] = [
  {
    platform: "GitHub",
    url: "https://github.com/tfshorifulislam",
    username: "tfshorifulislam",
    order: 0,
  },
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/tfshorifulislam/",
    username: "Shoriful Islam",
    order: 1,
  },
  {
    platform: "Email",
    url: "mailto:tfshorifulislam@gmail.com",
    username: "tfshorifulislam@gmail.com",
    order: 2,
  },
];

export const fundingLinks: FundingLink[] = [];

export const faqs: Faq[] = [
  {
    id: "who",
    question: "Who is Shoriful Islam?",
    answer:
      "Shoriful Islam is a Full Stack Web Developer focused on building modern, responsive, and reliable web applications using technologies such as React, Next.js, TypeScript, Node.js, Express, PostgreSQL, MongoDB, Prisma, and Redis.",
    order: 0,
  },
  {
    id: "what",
    question: "What does Shoriful build?",
    answer:
      "He builds modern web applications, full-stack platforms, REST APIs, responsive user interfaces, and practical software solutions focused on real-world problems.",
    order: 1,
  },
  {
    id: "stack",
    question: "What is Shoriful's tech stack?",
    answer:
      "His primary stack includes TypeScript, JavaScript, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Prisma, Redis, Tailwind CSS, and Git.",
    order: 2,
  },
  {
    id: "available",
    question: "Is Shoriful available for opportunities?",
    answer:
      "Shoriful is interested in opportunities where he can continue learning, contribute to real-world products, and grow as a software engineer.",
    order: 3,
  },
  {
    id: "contact",
    question: "How can I contact Shoriful?",
    answer:
      "You can reach Shoriful through the contact section of this website or connect with him through GitHub and LinkedIn.",
    order: 4,
  },
];
