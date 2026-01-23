'use client';
import Link from 'next/link';

interface BreadcrumbsProps {
  paths: { label: string; href?: string }[];
}

export default function Breadcrumbs({ paths }: BreadcrumbsProps) {
  return (
    <nav
      className="text-sm font-medium text-[#1F2323] mb-4 font-sans"
      aria-label="Breadcrumb"
    >
      {paths.map((path, idx) => {
        const isLast = idx === paths.length - 1
        const forceHref = path.href ?? (isLast ? `/${path.label.toLowerCase()}` : undefined)

        return (
          <span key={idx}>
            {forceHref ? (
              <Link
                href={forceHref}
                className="text-primary hover:underline"
              >
                {path.label}
              </Link>
            ) : (
              <span>{path.label}</span>
            )}
            {idx < paths.length - 1 && " / "}
          </span>
        )
      })}
    </nav>
  )
}