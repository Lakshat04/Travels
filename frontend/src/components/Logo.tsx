import narayanaLogo from '../assets/narayana-logo.png';

interface LogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm flex items-center justify-center shrink-0"
      style={{ height: size, padding: Math.max(2, size * 0.06) }}
    >
      <img
        src={narayanaLogo}
        alt="Narayana Travels"
        style={{ height: '100%', width: 'auto' }}
        className="object-contain select-none"
        draggable={false}
      />
    </div>
  );
}

export function Logo({ size = 40, variant = 'dark' }: LogoProps) {
  const titleColor = variant === 'dark' ? '#0B2447' : '#FFFFFF';
  const subColor = '#C9A227';
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <div className="text-left leading-tight">
        <div style={{ color: titleColor }} className="font-bold tracking-wide text-[17px]">
          NARAYANA TRAVELS
        </div>
        <div style={{ color: subColor }} className="text-[10px] font-semibold tracking-[0.2em] uppercase">
          Travel & Billing
        </div>
      </div>
    </div>
  );
}
