import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = ({ bgImage, children, id }) => {
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
      scrub: true,
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
          // We use w-full and h-auto to maintain the original aspect ratio.
          // min-h-screen ensures it never falls short of the viewport height.
          // object-top ensures the scroll starts from the very top of the image.
          className="absolute top-0 left-0 w-full min-h-screen h-auto object-cover object-top"
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
