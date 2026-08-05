import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

interface RegionSection {
  title: string;
  links: { href: string; label: string }[];
}

const SECTIONS: RegionSection[] = [
  {
    title: '영남대 맛집 선택하기',
    links: [
      { href: '/test?region=yeongnam&mode=select', label: '리스트에서 선택하기' },
      { href: '/test?region=yeongnam&mode=swipe', label: '스와이프로 선택하기' },
    ],
  },
  {
    title: 'Choose a Seattle Downtown Restaurant',
    links: [
      { href: '/test?region=seattle&mode=select', label: 'Select from a List' },
      { href: '/test?region=seattle&mode=swipe', label: 'Swipe to Choose' },
    ],
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-card">
          <UtensilsCrossed size={26} />
        </span>
        <h1 className="text-2xl font-extrabold text-ink">오늘 뭐 먹지?</h1>
        <p className="text-sm text-ink-muted">
          1:1 토너먼트로 30초 안에 오늘의 맛집을 정해보세요.
        </p>
      </div>

      <div className="flex w-full flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title} className="flex w-full flex-col gap-2.5">
            <h2 className="text-left text-base font-bold text-ink">
              {section.title}
            </h2>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-full rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm font-semibold text-ink shadow-card transition-transform active:scale-[0.98]"
              >
                {link.label}
              </Link>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
