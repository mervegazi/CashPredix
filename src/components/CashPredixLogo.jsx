export default function CashPredixLogo({ className = 'w-6 h-6', glow = false }) {
  const logoUrl = `${import.meta.env.BASE_URL}favicon.svg`;
  return (
    <img
      src={logoUrl}
      alt="CashPredix"
      className={`${className} object-contain ${glow ? 'drop-shadow-[0_0_10px_rgba(189,52,254,0.55)]' : ''} select-none transition-transform inline-block shrink-0`}
      loading="eager"
    />
  );
}
