import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="min-h-screen p-8">
      <h1 class="text-2xl font-semibold text-slate-800">ScoreHub</h1>
      <p class="mt-2 text-slate-600">Angular 17 + Tailwind готовы к дальнейшей сборке.</p>
    </main>
  `,
})
export class HomeComponent {}
