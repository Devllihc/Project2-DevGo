import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = ({ bgImage, children, id, priority = false }) => {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(() => {
    // Calculate how much of the image is overflowing the viewport vertically
    const calculateOverflow = () => {
      if (!imgRef.current) return 0;
      const imgHeight = imgRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      return Math.max(0, imgHeight - windowHeight);
    };

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: bgRef.current,
      pinSpacing: false,
      animation: gsap.fromTo(
        imgRef.current,
        { y: 0 },
        { 
          y: () => -calculateOverflow(), 
          ease: "none" 
        }
      ),
      scrub: 1.5, // Changed from true to 1.5 for a smooth "catch-up" effect
      invalidateOnRefresh: true, // Recalculates value on screen resize
    });
  }, { scope: containerRef });

  return (
    <section id={id} ref={containerRef} className="relative w-full text-white dark">
      {/* Background that gets pinned */}
      <div ref={bgRef} className="absolute top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
        <img
          ref={imgRef}
          src={bgImage}
          alt="Parallax Background"
          onLoad={() => ScrollTrigger.refresh()}
          decoding="async" // Offloads image decoding from the main thread
          loading={priority ? "eager" : "lazy"} // Lazy load if not priority
          fetchPriority={priority ? "high" : "auto"} // High priority fetch for hero sections
          // We use w-full and h-auto to maintain the original aspect ratio.
          // min-h-screen ensures it never falls short of the viewport height.
          // object-top ensures the scroll starts from the very top of the image.
          // will-change-transform tells the browser to optimize this element for animations via GPU
          className="absolute top-0 left-0 w-full min-h-screen h-auto object-cover object-top will-change-transform"
        />
        {/* Even Clearer Overlay: reduced opacity to 30% and removed blur completely for maximum clarity */}
        <div className="absolute inset-0 bg-stone-900/30 dark:bg-stone-950/30" />
      </div>

      {/* Content that scrolls naturally over the pinned background */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-center pt-24 pb-8">
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;
