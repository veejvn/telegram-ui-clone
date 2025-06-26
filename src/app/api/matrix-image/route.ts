// app/api/matrix-image/route.js (cho App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request : any) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  console.log('Matrix image request:', url);
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes('matrix.org')) {
      return NextResponse.json({ error: 'Invalid URL domain' }, { status: 400 });
    }

    console.log('Fetching image from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'NextJS-Matrix-Client/1.0',
        'Accept': 'image/*',
      },
      // Timeout sau 10 giây
      signal: AbortSignal.timeout(10000),
    });

    console.log('Fetch response status:', response.status);

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `Failed to fetch image: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    console.log('Content type:', contentType);
    
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Response is not an image' }, { status: 400 });
    }

    const imageBuffer = await response.arrayBuffer();
    console.log('Image buffer size:', imageBuffer.byteLength);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error : any) {
    console.error('Error in matrix-image API:', error);
    
    if (error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}