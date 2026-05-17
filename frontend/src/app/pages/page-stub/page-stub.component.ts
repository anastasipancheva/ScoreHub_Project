import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-stub',
  standalone: true,
  template: `<h1 class="text-xl font-semibold text-[#1A1A1B]">{{ title }}</h1>`,
})
export class PageStubComponent {
  private route = inject(ActivatedRoute);

  title = this.route.snapshot.data['title'] as string;
}
