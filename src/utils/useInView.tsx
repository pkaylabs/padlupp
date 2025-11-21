import { useEffect, useRef, useState } from "react";

export const useInView = (rootMargin = "-10%") => {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: null, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView } as const;
};