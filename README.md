# Shoriful Islam — Personal Portfolio

A modern, minimal, and responsive personal portfolio built to showcase my work, experience, skills, and journey as a Full Stack Web Developer.

## ✨ Features

* Modern and minimal UI
* Fully responsive design
* Smooth motion animations
* Hero section with personal introduction
* About section
* Skills and technologies
* Professional experience
* Featured projects
* Services
* Support
* GitHub contributions graph
* FAQ section
* Contact section
* Social media links
* Dark/light theme support
* SEO-friendly structure
* Fast and optimized frontend

## 🛠️ Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Framer Motion**
* **Lucide Icons**

## 📂 Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── analytics/      # Google Analytics
│   ├── background/     # ambient canvas backdrop
│   ├── brand/          # logo + X mark
│   ├── common/         # scroll-to-top
│   ├── home/           # Hero, About, GitHub, Skills, Experience,
│   │                   # Projects, Services, Support, Contact
│   ├── layout/         # Footer
│   ├── motion/         # Reveal + Magnetic
│   ├── navbar/         # SiteNav + menu overlay + appearance menu
│   ├── providers/      # theme provider
│   ├── sections/       # FAQ
│   ├── ui/             # Button, Card, Section, Dialog, Lightbox, Meteors
│   └── util/
│
├── content/
│   ├── data.ts
│   ├── index.ts
│   └── types.ts
│
├── hooks/
├── lib/                # brand, palettes, GitHub reads, SEO, project merge
└── utils/
```

All portfolio content is managed through local TypeScript data.
There is no database or external CMS required.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tfshorifulislam/portfolio.git
```

### 2. Go to the project directory

```bash
cd portfolio
```

### 3. Install dependencies

```bash
npm install
```

### 4. Environment

The site runs with no configuration at all. Two optional variables enable live figures:

```text
GITHUB_TOKEN=                     # required for the GitHub contributions graph (GraphQL has no anonymous mode)
NEXT_PUBLIC_SITE_URL=             # canonical origin for SEO tags, sitemap and robots
```

Without `GITHUB_TOKEN` the contributions section simply hides itself; the rest of the page is
unaffected.

### 5. Start the development server

```bash
npm run dev
```

Open http://localhost:4000 in your browser.

## 🏗️ Build for Production

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## ✏️ Customize

Portfolio content can be updated from:

```text
src/content/data.ts
```

You can update:

* Personal information
* About section
* Experience
* Skills
* Projects
* Services
* Social links
* FAQs

Images and other static assets can be placed inside:

```text
public/
```

## 📱 Responsive Design

The portfolio is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

## 🎯 Purpose

This portfolio is built to present my experience and projects as a Full Stack Web Developer while keeping the interface simple, readable, and focused on the work.

## 👨‍💻 About Me

I'm **Shoriful Islam**, a Full Stack Web Developer focused on building modern, responsive, and reliable web applications.

I work primarily with:

**TypeScript · JavaScript · React · Next.js · Node.js · Express · PostgreSQL · MongoDB · Prisma · Redis**

## 📄 License

This project is created for personal portfolio purposes.

---

**Built by Shoriful Islam**
