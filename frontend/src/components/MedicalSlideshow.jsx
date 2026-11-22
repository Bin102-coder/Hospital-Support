import { useEffect, useState } from "react";

function SceneHospital() {
  return (
    <svg viewBox="0 0 400 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="skyH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#skyH)" />
      <rect x="50" y="90" width="300" height="150" rx="10" fill="#ffffff" stroke="#0d9488" strokeWidth="2" />
      <rect x="90" y="120" width="50" height="40" fill="#cbd5e1" />
      <rect x="160" y="120" width="50" height="40" fill="#cbd5e1" />
      <rect x="230" y="120" width="50" height="40" fill="#cbd5e1" />
      <rect x="300" y="120" width="30" height="40" fill="#cbd5e1" />
      <rect x="170" y="180" width="60" height="60" fill="#0d9488" />
      <rect x="188" y="195" width="24" height="40" fill="#ffffff" />
      <rect x="175" y="60" width="50" height="30" rx="6" fill="#0d9488" />
      <text x="200" y="82" textAnchor="middle" fontSize="20" fill="#ffffff" fontWeight="700">H</text>
      <circle className="anim-pulse" cx="330" cy="50" r="20" fill="#fde68a" />
      <rect x="0" y="240" width="400" height="20" fill="#86efac" />
    </svg>
  );
}

function SceneDoctor() {
  return (
    <svg viewBox="0 0 400 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="260" fill="#e0f2fe" />
      <rect x="0" y="200" width="400" height="60" fill="#bae6fd" />
      <rect x="120" y="60" width="160" height="140" rx="12" fill="#ffffff" stroke="#0d9488" />
      <circle cx="200" cy="100" r="28" fill="#fde68a" />
      <rect x="172" y="128" width="56" height="60" rx="8" fill="#0d9488" />
      <rect x="188" y="140" width="24" height="40" fill="#ffffff" />
      <rect x="260" y="90" width="80" height="100" rx="8" fill="#ffffff" stroke="#94a3b8" />
      <rect x="270" y="100" width="60" height="12" fill="#0d9488" />
      <rect x="270" y="120" width="60" height="8" fill="#cbd5e1" />
      <rect x="270" y="135" width="60" height="8" fill="#cbd5e1" />
    </svg>
  );
}

function SceneNurse() {
  return (
    <svg viewBox="0 0 400 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="260" fill="#f0fdfa" />
      <rect x="0" y="210" width="400" height="50" fill="#a7f3d0" />
      <circle cx="150" cy="90" r="26" fill="#fde68a" />
      <rect x="124" y="116" width="52" height="70" rx="8" fill="#0d9488" />
      <rect x="140" y="128" width="20" height="50" fill="#ffffff" />
      <rect x="230" y="80" width="120" height="120" rx="10" fill="#ffffff" stroke="#0d9488" />
      <rect x="245" y="95" width="90" height="14" fill="#0d9488" />
      <rect x="245" y="118" width="90" height="8" fill="#cbd5e1" />
      <rect x="245" y="133" width="90" height="8" fill="#cbd5e1" />
      <rect x="245" y="148" width="90" height="8" fill="#cbd5e1" />
      <circle className="anim-pulse" cx="300" cy="50" r="16" fill="#fca5a5" />
    </svg>
  );
}

const SCENES = [SceneHospital, SceneDoctor, SceneNurse];

export default function MedicalSlideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SCENES.length), 4000);
    return () => clearInterval(timer);
  }, []);
  const Scene = SCENES[index];
  return (
    <div className="scene-wrap fade-in" key={index}>
      <Scene />
    </div>
  );
}
