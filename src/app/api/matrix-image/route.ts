// app/api/matrix-image/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);

    // ✅ Cho phép các domain matrix phổ biến hoặc domain homeserver
    const allowedDomains = [
      "matrix.org",
      "media.matrix.org",
      "matrix-client.matrix.org",
    ];
    // Cho phép mọi domain có chứa "matrix."
    const isAllowed =
      allowedDomains.includes(parsedUrl.hostname) ||
      parsedUrl.hostname.includes("matrix.");

    if (!isAllowed) {
      return NextResponse.json({ error: "Blocked domain" }, { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        Accept: "image/*",
        "User-Agent": "Matrix-Image-Proxy/1.0",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid content-type" }, { status: 400 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": imageBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error fetching matrix image:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
