// src/app/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_CONFIG } from '@/app';
import alc from '@/images/alc-logo.svg'
import FooterDaimon from './Footer-daimon'

const Footer = () => {
  return (
    <div>
      <div className='h-30'></div>
        <footer className="p-6 bg-dark text-white border-t-2 border-[var(--color-accent)]" aria-labelledby="footer-heading">
      <div className="max-w-7xl mx-auto">
        <nav
          id="footer-heading"
          className="flex flex-col md:flex-row md:justify-between gap-12"
          aria-label="Основные ссылки и информация"
        >
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

          {/* Логотип */}
          <Link href="/" className="flex items-center md:mx-auto my-4 md:my-0">
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
          <div className="flex flex-col gap-1 text-[var(--color-gray)] text-sm text-right">
            {FOOTER_CONFIG.legal.map(link => (
              <FooterLink
                key={link.href}
                href={link.href}
                className="hover:text-[var(--color-accent)]"
              >
                {link.text}
              </FooterLink>
            ))}
            <span className="mt-4 block">
              © Все права защищены. {new Date().getFullYear()}
            </span>
          </div>
        </nav>
      </div>
    </footer>
      <div className="p-2 bg-black ">
        <p className="text-left text-sm md:text-sm font-extralight text-white container mx-auto Bounded max-w-7xl ">
          Разработано DAIMON
        </p>
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