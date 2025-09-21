export function debounce(
  callBack: (...args: unknown[]) => void,
  delay: number = 500,
) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => callBack.apply(this, args), delay);
  };
}
