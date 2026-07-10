import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use setTimeout to ensure it runs after GSAP ScrollTrigger cleans up and new DOM mounts
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      });
    }, 50);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
