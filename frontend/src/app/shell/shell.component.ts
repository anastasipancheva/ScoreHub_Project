import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F9FAFB]">
      <header class="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div class="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div class="flex items-center gap-8">
            <a routerLink="/" class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-[#005BFF] flex items-center justify-center">
                <span class="text-white text-xs font-bold">S</span>
              </div>
              <span class="font-semibold text-[#1A1A1B] text-sm tracking-wide">ScoreHub</span>
            </a>
            <nav class="flex gap-1">
              @for (item of navItems; track item.href) {
                <a
                  [routerLink]="item.href"
                  routerLinkActive="bg-[#EAF2FF] text-[#005BFF]"
                  [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-[#6B7280] hover:text-[#1A1A1B] hover:bg-[#F3F4F6]"
                >
                  {{ item.label }}
                </a>
              }
            </nav>
          </div>
          <div class="flex items-center gap-3">
            <a
              routerLink="/notifications"
              (click)="unread.set(0)"
              class="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-[#005BFF] hover:bg-[#EAF2FF] transition-colors"
            >
              🔔
              @if (unread() > 0) {
                <span
                  class="absolute -top-0.5 -right-0.5 bg-[#005BFF] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5"
                >
                  {{ unread() > 99 ? '99+' : unread() }}
                </span>
              }
            </a>
            <div class="h-5 w-px bg-[#E5E7EB]"></div>
            <a
              routerLink="/profile"
              class="text-sm text-[#1A1A1B] font-medium hover:text-[#005BFF] transition-colors"
            >
              Пользователь
            </a>
            <button
              type="button"
              (click)="logout()"
              class="flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
              title="Выйти"
            >
              ⏏
            </button>
          </div>
        </div>
      </header>
      <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  private router = inject(Router);

  unread = signal(0);

  readonly navItems = [
    { href: '/', label: 'Главная', exact: true },
    { href: '/scores', label: 'Баллы', exact: false },
    { href: '/courses', label: 'Курсы', exact: false },
  ];

  logout() {
    this.router.navigate(['/login']);
  }
}
