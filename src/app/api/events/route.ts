import { ok, route } from "@/lib/api/http";
import { searchParamsToObject } from "@/lib/api/request";
import { paginationMeta } from "@/lib/dto";
import { listAvailableCities, listUpcomingEvents } from "@/lib/services/event.service";
import { eventListQuerySchema } from "@/lib/validators/event";

/**
 * GET /api/events?category=Music&city=Coimbatore&q=night&page=1
 *
 * Only active, upcoming events, nearest first. Category, city and text search
 * are applied together as AND conditions, then paginated (6 per page).
 */
export const dynamic = "force-dynamic";

export const GET = route(async (request) => {
  const query = eventListQuerySchema.parse(searchParamsToObject(request.nextUrl.searchParams));

  const [{ events, total }, availableCities] = await Promise.all([
    listUpcomingEvents({
      category: query.category,
      city: query.city,
      q: query.q,
      page: query.page,
      pageSize: query.pageSize,
    }),
    listAvailableCities(),
  ]);

  return ok(events, {
    meta: {
      ...paginationMeta(query.page, query.pageSize, total),
      availableCities,
      filters: {
        category: query.category ?? null,
        city: query.city ?? null,
        q: query.q ?? null,
      },
    },
  });
});
