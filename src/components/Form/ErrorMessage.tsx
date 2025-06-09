import { ErrorMessageProps } from "@/types/form";

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="text-red-600 mb-4">{message}</p>;
}