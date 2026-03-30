export interface NavLink {
  readonly label: string
  readonly href: string
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Ogłoszenia', href: '/ogloszenia' },
  { label: 'Baza Firm', href: '/baza-firm' },
  { label: 'Giełda', href: '/gielda' },
  { label: 'Aktualności', href: '/aktualnosci' },
] as const
