export const isOnlyEmojis = (text: string) => {
  const trimmed = text.trim();

  // Regex hỗ trợ cả các emoji ZWJ (Zero Width Joiner sequence)
  const emojiRegex =
    /^(?:\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*)+$/gu;

  const matched = [...trimmed.matchAll(emojiRegex)];

  return (
    matched.length &&
    matched.map((m) => m[0]).join("") === trimmed &&
    matched.length <= 3
  );
};
