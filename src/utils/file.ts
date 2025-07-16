// src/utils/file.ts
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as ArrayBuffer);
        reader.onerror = e => rej(e);
        reader.readAsArrayBuffer(file);
    });
}
