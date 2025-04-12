"use client";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
}

export function NavLink({ href, children, mobile }: NavLinkProps) {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a 
      href={href} 
      onClick={scrollToSection}
      className={`text-gray-300 hover:text-emerald-500 transition-colors text-sm ${
        mobile ? 'block px-3 py-2' : ''
      }`}
    >
      {children}
    </a>
  );
}