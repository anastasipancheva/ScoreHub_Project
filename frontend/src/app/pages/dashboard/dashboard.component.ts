import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-6 max-w-3xl">
      <div class="bg-[#EAF2FF] rounded-xl border border-[#C7DCFF] px-6 py-5">
        <p class="text-sm text-[#005BFF] font-medium mb-0.5">Добро пожаловать</p>
        <h1 class="text-xl font-semibold text-[#1A1A1B]">ScoreHub</h1>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
