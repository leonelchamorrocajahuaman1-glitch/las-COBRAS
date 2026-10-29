interface Props {
  className?: string
  claro?: boolean
}

export function Logo({ className = '', claro = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="18" fill={claro ? '#fdfbf7' : '#3f7a52'} />
        <g fill={claro ? '#3f7a52' : '#fdfbf7'}>
          <ellipse cx="20" cy="24" rx="5" ry="6.5" />
          <ellipse cx="32" cy="18" rx="5" ry="6.5" />
          <ellipse cx="44" cy="24" rx="5" ry="6.5" />
        </g>
        <path
          fill="#f6a56f"
          d="M32 52c-1 0-12-7-12-15 0-4 3-7 6.5-7 2.4 0 4.3 1.3 5.5 3.2C33.2 31.3 35.1 30 37.5 30c3.5 0 6.5 3 6.5 7 0 8-11 15-12 15z"
        />
      </svg>
      <span className={`font-display text-xl leading-none font-black tracking-tight whitespace-nowrap ${claro ? 'text-white' : 'text-salvia-800'}`}>
        Huellitas <span className={claro ? 'text-durazno-200' : 'text-durazno-600'}>de Amor</span>
      </span>
    </span>
  )
}
