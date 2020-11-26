import { Component } from '@angular/core';
import {LinkModel} from './link/link.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Olivier Duval';
  links: LinkModel[] = [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/oduval/' },
    { label: 'Twitter', url: 'https://twitter.com/zorky'},
    { label: 'Devto', url: 'https://dev.to/zorky'}
    ];
}
