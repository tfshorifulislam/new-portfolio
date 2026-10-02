"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
const INVERT_IN_LIGHT = /nextjs|next-js|next\.|vercel|express|flask|github|apple/i;
// Marks that are dark on a light ground need the opposite treatment: keep them
// dark in light mode, flip them light for the dark card surface.
const INVERT_IN_DARK = /prisma/i;

export function SkillCard({ name, iconPath }: { name: string; iconPath: string }) {
  const invertLight = INVERT_IN_LIGHT.test(iconPath) || INVERT_IN_LIGHT.test(name);
  const invertDark = INVERT_IN_DARK.test(iconPath) || INVERT_IN_DARK.test(name);
  return (
    <motion.li
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border-border bg-surface hover:border-foreground/20 hover:bg-surface-2 flex h-full flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition motion-reduce:transform-none motion-reduce:transition-none"
    >
      <span className="bg-surface-2 relative flex size-12 items-center justify-center rounded-xl p-1.5">
        <Image
          src={iconPath}
          alt=""
          fill
          sizes="48px"
          unoptimized
          className={cn(
            "object-contain p-1",
            invertLight && "invert dark:invert-0",
            invertDark && "dark:invert",
          )}
          onError={() => {}}
        />
      </span>
      <span className="text-foreground/80 text-center text-xs leading-snug font-medium">
        {name}
      </span>
    </motion.li>
  );
}
