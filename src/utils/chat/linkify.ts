import React from "react";

export function linkify(text: string) {
    const urlRegex = /((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    text.replace(urlRegex, (url, _full, _proto, _domain, _path, offset) => {
        if (lastIndex < offset) {
            elements.push(text.slice(lastIndex, offset));
        }
        const match = url.match(/^(.+?)([.,!?])?$/);
        const urlPart = match ? match[1] : url;
        const punctuation = match && match[2] ? match[2] : "";
        const href = urlPart.startsWith('http') ? urlPart : 'https://' + urlPart;
        elements.push(
            React.createElement(
                "a",
                {
                    key: offset,
                    href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-600 underline break-all"
                },
                urlPart
            )
        );
        if (punctuation) elements.push(punctuation);
        lastIndex = offset + url.length;
        return url;
    });

    if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
    }
    return elements;
} 