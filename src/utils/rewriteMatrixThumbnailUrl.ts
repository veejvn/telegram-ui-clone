export function rewriteMatrixThumbnailUrl(originalUrl: string): string {
    try {
        const url = new URL(originalUrl);
        // Đổi hostname sang matrix-client.matrix.org
        url.hostname = "matrix-client.matrix.org";

        // Cập nhật các tham số truy vấn
        url.searchParams.set("width", "72");
        url.searchParams.set("height", "72");
        url.searchParams.set("method", "crop");
        url.searchParams.set("allow_redirect", "true");

        return url.toString();
    } catch (err) {
        console.error("Invalid URL:", originalUrl);
        return originalUrl; // fallback
    }
}
