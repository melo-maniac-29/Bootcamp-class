import React from 'react';

export default function StudentLoginIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-h-[350px] select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Subtle organic background blobs */}
      <path d="M120,80 Q180,40 280,70 T420,120 T380,260 T220,320 T90,240 Z" fill="white" fillOpacity="0.05" />
      <circle cx="150" cy="180" r="120" fill="white" fillOpacity="0.03" />
      <circle cx="380" cy="220" r="90" fill="white" fillOpacity="0.03" />

      {/* Stylized Data-block document for sitting person */}
      <g transform="translate(260, 210)">
        {/* Document base block */}
        <path d="M0,40 L140,0 L140,70 L0,110 Z" fill="#ffffff" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Grid lines on the document */}
        <line x1="30" y1="45" x2="110" y2="25" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="30" y1="65" x2="110" y2="45" stroke="#000000" strokeWidth="2" />
        <line x1="30" y1="85" x2="110" y2="65" stroke="#000000" strokeWidth="2" />
      </g>

      {/* Sitting person on the document holding laptop */}
      <g transform="translate(300, 110)">
        {/* Head */}
        <circle cx="50" cy="30" r="14" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        {/* Torso */}
        <path d="M50,44 L50,90" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        {/* Cross-legged legs */}
        <path d="M20,105 Q50,90 80,105" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M30,105 Q50,98 70,105" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Laptop */}
        <path d="M12,85 L37,85 L47,68" stroke="#000000" strokeWidth="2" fill="#ffffff" strokeLinejoin="round" strokeLinecap="round" />
        {/* Arms holding laptop */}
        <path d="M50,56 C35,62 25,72 20,82" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Walking person on the left holding smartphone, wearing backpack */}
      <g transform="translate(70, 90)">
        {/* Backpack */}
        <path d="M48,80 C36,80 34,120 48,120 Z" fill="#000000" stroke="#000000" strokeWidth="2" />
        {/* Head */}
        <circle cx="70" cy="40" r="15" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        {/* Torso */}
        <path d="M70,55 L70,115" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        {/* Walking Legs */}
        <path d="M70,115 L50,165 L35,170" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M70,115 L90,160 L105,163" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arm holding smartphone */}
        <path d="M70,70 Q95,78 95,95" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Smartphone */}
        <rect x="92" y="93" width="8" height="15" rx="2" fill="#ffffff" stroke="#000000" strokeWidth="1.5" transform="rotate(10, 92, 93)" />
      </g>

      {/* Potted Plant */}
      <g transform="translate(210, 270)">
        {/* Pot */}
        <path d="M10,40 L30,40 L25,65 L15,65 Z" fill="#000000" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
        {/* Plant Stem & Leaves */}
        <path d="M20,40 Q20,10 5,5" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M20,40 Q25,15 35,8" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Leaf shapes */}
        <path d="M5,5 Q12,0 15,10 Q5,12 5,5 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <path d="M35,8 Q28,12 30,22 Q38,18 35,8 Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
      </g>

      {/* Stylized magnifying glass */}
      <g transform="translate(170, 70) rotate(-15)">
        <circle cx="20" cy="20" r="12" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        <line x1="29" y1="29" x2="42" y2="42" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
