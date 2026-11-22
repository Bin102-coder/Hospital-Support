import { useEffect, useState } from "react";

const IMAGES = [
  "/slideshow/Bac-Si-Bach-Mai.jpeg",
  "/slideshow/bach-mai-2-1791544053133389229546.jpg",
  "/slideshow/dsc9076-1782362169567.webp",
  "/slideshow/z7223892653954-d5b24d6196d534c188493b7ef1698f0c.jpg",
];

export default function MedicalSlideshow({ ratio = "16 / 9", maxWidth = "100%" }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="scene-wrap" style={{ position: "relative", width: "100%", maxWidth, aspectRatio: ratio, borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow)" }}>
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
