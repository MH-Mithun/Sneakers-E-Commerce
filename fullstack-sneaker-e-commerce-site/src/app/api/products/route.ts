import { listProducts } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const num = (k: string) => {
    const v = sp.get(k);
    return v && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };
  const items = await listProducts({
    category: sp.get("category") ?? undefined,
    brand: sp.get("brand") ?? undefined,
    q: sp.get("q") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    size: sp.get("size") ?? undefined,
    min: num("min"),
    max: num("max"),
    limit: num("limit"),
  });
  return Response.json({ products: items });
}
