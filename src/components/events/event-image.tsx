"use client";

import { useState } from "react";

import { CATEGORY_GRADIENTS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/enums";

/**
 * A plain <img> rather than next/image: event images are arbitrary
 * admin-supplied URLs, and a server-side optimiser would fail hard on an
 * unreachable host. Instead the gradient placeholder takes over.
 */
export function EventImage({
  src,
  alt,
  category,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  category: Category;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br text-white",
          CATEGORY_GRADIENTS[category],
          className,
        )}
      >
        <span className="font-display text-sm font-semibold uppercase tracking-wider opacity-90">
          {CATEGORY_LABELS[category]}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      sizes={sizes}
      className={cn("bg-secondary object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
