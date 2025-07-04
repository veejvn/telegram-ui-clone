import clsx from "clsx";

export const BubbleTail = ({
  isSender,
  fillColor,
}: {
  isSender: boolean;
  fillColor: string;
}) => {
  return (
    <svg
      viewBox="0 0 11 20"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(
        "h-[60%] w-[25px] shrink-0 ",
        isSender ? "-ml-1" : "-mr-1 -rotate-y-180"
      )}
      preserveAspectRatio="none"
    >
      <path
        d="M11 20C4.46592 14.9222 2.16956 10.4109 0 0V20H11Z"
        fill={fillColor}
      />
    </svg>
  );
};
