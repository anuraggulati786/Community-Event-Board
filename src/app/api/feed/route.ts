import { ok, route } from "@/lib/api/http";
import { searchParamsToObject } from "@/lib/api/request";
import { requireUser } from "@/lib/auth/session";
import { paginationMeta } from "@/lib/dto";
import { getFeedForUser } from "@/lib/services/feed.service";
import { eventListQuerySchema } from "@/lib/validators/event";

export const dynamic = "force-dynamic";

/**
 * GET /api/feed - upcoming active events from the user's favourite categories,
 * nearest first. An empty `favoriteCategories` returns zero events, which the
 * UI renders as "No events available for your selected interests."
 */
export const GET = route(async (request) => {
  const session = await requireUser();
  const query = eventListQuerySchema.parse(searchParamsToObject(request.nextUrl.searchParams));

  const { events, total, favoriteCategories } = await getFeedForUser(
    session.sub,
    query.page,
    query.pageSize,
  );

  return ok(events, { meta: { ...paginationMeta(query.page, query.pageSize, total), favoriteCategories } });
});
