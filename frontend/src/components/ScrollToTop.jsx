import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant scroll to top on route change to prevent GSAP calculation issues
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    // Give DOM a small tick to update before refreshing ScrollTriggers
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
