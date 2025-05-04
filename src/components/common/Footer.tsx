// src/app/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_CONFIG } from '@/app';
import alc from '@/images/alc-logo.svg'

const Footer = () => {
  return (
    <div>
      <footer className="p-6 bg-dark text-white border-t-2 border-[var(--color-accent)] sm:" aria-labelledby="footer-heading">
        <div className="max-w-7xl mx-auto">
          <nav
            id="footer-heading"
            className="flex flex-row md:justify-between md:gap-12"
            aria-label="Основные ссылки и информация"
          >
            <div>
              {/* Левая колонка */}
              <div className="flex flex-col gap-1 text-[var(--color-gray)] text-sm my-auto text-left">
                {FOOTER_CONFIG.leftColumn.map(link => (
                  <FooterLink 
                    key={link.href}
                    href={link.href}
                    className='hover:text-[var(--color-accent)]'
                    >
                    {link.text}
                  </FooterLink>
                ))}
              </div>
              <div className="md:hidden flex flex-col gap-1 text-[var(--color-gray)] text-sm md:text-right">
              {FOOTER_CONFIG.legal.map(link => (
                <FooterLink
                  key={link.href}
                  href={link.href}
                  className="hover:text-[var(--color-accent)]"
                >
                  {link.text}
                </FooterLink>
              ))}
            </div>
            </div>
            

            {/* Логотип */}
            <Link href="/" className="flex items-center mx-auto my-4 md:my-0">
                <Image
                  src={alc}
                  alt="albumen corp"
                  width={160}
                  height={40}
                  className="object-contain"
                  priority
                />
            </Link>

            {/* Правая колонка */}
            <div className="hidden md:flex flex-col gap-1 text-[var(--color-gray)] text-sm text-right">
              {FOOTER_CONFIG.legal.map(link => (
                <FooterLink
                  key={link.href}
                  href={link.href}
                  className="hover:text-[var(--color-accent)]"
                >
                  {link.text}
                </FooterLink>
              ))}
            </div>
          </nav>
        </div>
     </footer>
      <div className="p-2 bg-black flex justify-between">
        <p className="text-left text-xs md:text-sm font-extralight text-white container mx-auto Bounded  ">
          Разработано DAIMON
        </p>
        <p className='text-right text-xs md:text-sm font-extralight text-white container mx-auto Bounded '> © Все права защищены. {new Date().getFullYear()}</p>
      </div>
    </div>
    
  );
};

const FooterLink = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a
    href={href}
    className={`transition-colors duration-200 ${className || ''}`}
  >
    {children}
  </a>
);

export default Footer;