import { useEffect, useState } from "react";

const IMAGES = ["/slideshow/1.jpg", "/slideshow/2.jpg", "/slideshow/3.jpg"];

export default function MedicalSlideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="scene-wrap" style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
      {IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Y te"
          className="slide-img"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
