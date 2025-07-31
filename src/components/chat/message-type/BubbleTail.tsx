import clsx from "clsx";

export const BubbleTail = ({
  isSender,
  fillColor,
}: {
  isSender: boolean;
  fillColor: string;
}) => {
  return (
    // <svg
    //   viewBox="0 0 11 20"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className={clsx(
    //     "h-[60%] w-[25px] shrink-0 ",
    //     isSender ? "-ml-1" : "-mr-1 -rotate-y-180"
    //   )}
    //   preserveAspectRatio="none"
    // >
    //   <path
    //     d="M11 20C4.46592 14.9222 2.16956 10.4109 0 0V20H11Z"
    //     fill={fillColor}
    //   />
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="145.17 271.184 24.3561 16.8469"
      width="16px"
      height="12px"
      className={clsx(
        "shrink-0 ",
        isSender ? "-ml-1" : "-mr-1 -rotate-y-180"
      )}
    >
      <path
        fill={fillColor}
        d="M 145.17 286.779 C 145.939 288.624 157.388 275.113 155.751 271.184 L 169.489 282.323 C 170.609 286.522 146.023 289.977 145.17 286.779 Z"
        transform="matrix(1, 0, 0, 1, -2.842170943040401e-14, 0)"
      />
    </svg>
  );
};
