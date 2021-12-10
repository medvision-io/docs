import { useEffect, useState } from "react";
import {isBrowser} from "../components/Redoc/Markdown/SanitizedMdBlock";

export default function useOnScreen(ref, callback) {
  const [isIntersecting, setIntersecting] = useState(false);

  if(!isBrowser()) {
    return false;
  }
  const observer = new IntersectionObserver(([entry]) => {
    setIntersecting(entry.isIntersecting);
    if (callback) {
      callback(entry.isIntersecting);
    }
  });

  useEffect(() => {
    observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, []);

  return isIntersecting;
}
