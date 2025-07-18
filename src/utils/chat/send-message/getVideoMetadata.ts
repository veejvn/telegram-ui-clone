export type Metadata = {
    duration: number;
    width: number;
    height: number;
}

export function getVideoMetadata(file: File): Promise<Metadata> {
return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
    URL.revokeObjectURL(video.src);
    resolve({
        duration: video.duration * 1000,
        width: video.videoWidth,
        height: video.videoHeight,
    });
    };

    video.onerror = () => {
    reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
});
}