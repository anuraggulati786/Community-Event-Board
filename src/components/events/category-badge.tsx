import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/generated/prisma/enums";

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border", CATEGORY_STYLES[category], className)}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
