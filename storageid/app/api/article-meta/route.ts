import { NextResponse } from "next/server";

// Run on the Edge for low-latency, fully serverless
export const runtime = "edge";

// Optional: tune caching so repeat requests for the same URL are cheaper
const defaultCacheSeconds = 60 * 10; // 10 minutes

function getMeta(content: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = content.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return undefined;
}

function absolutize(
  src: string | undefined,
  baseUrl: string
): string | undefined {
  if (!src) return undefined;
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");

    if (!target) {
      return NextResponse.json(
        { error: "Missing `url` query parameter" },
        { status: 400 }
      );
    }

    // Fetch the target page HTML
    const res = await fetch(target, {
      headers: {
        // A reasonable UA helps some sites return OG tags
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsMetaFetcher/1.0; +https://example.com)",
      },
      // Edge runtime allows external fetch just fine
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream responded ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // VERY lightweight meta extraction via regex; no Node-only libs required on Edge
    const title = getMeta(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]);

    const description = getMeta(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ]);

    const imageRaw = getMeta(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ]);

    const imageUrl = absolutize(imageRaw, target);

    const payload = {
      url: target,
      title: title ?? null,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      fetchedAt: new Date().toISOString(),
    };

    const resp = NextResponse.json(payload);

    // Cache at the edge for a short period; tune as you like
    resp.headers.set(
      "Cache-Control",
      `public, s-maxage=${defaultCacheSeconds}, stale-while-revalidate=${defaultCacheSeconds}`
    );

    return resp;
  } catch (err) {
    console.error("article-meta error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
