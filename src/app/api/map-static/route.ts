export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
  
    const apiKey = process.env.GMAP_API_KEY!;
    const googleURL = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:blue%7C${lat},${lng}&key=${apiKey}`;
    console.log(googleURL)
    const response = await fetch(googleURL);
    const blob = await response.blob();
  
    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  }
  