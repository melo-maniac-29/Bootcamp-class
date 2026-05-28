'use client';

/**
 * A minimal, static, premium SaaS-style background.
 * Replaces the heavy canvas animations with a clean, 
 * subtle radial gradient to provide depth without noise.
 */
export default function SocietyBackground({ society, customColor }) {
  // We use a very subtle static glow based on the custom color or a default.
  // The goal is a distraction-free, elegant, production-ready environment.
  
  const baseColor = customColor || 'rgba(255, 255, 255, 0.03)';
  
  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-background">
      {/* Subtle radial gradient overlay */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] opacity-30 mix-blend-screen"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${baseColor} 0%, transparent 70%)`
        }}
      />
      
      {/* Optional: extremely subtle noise texture can be added here if desired via CSS, 
          but keeping it pure CSS for maximum performance. */}
    </div>
  );
}