import { Component, OnInit } from '@angular/core';
import {LinkModel} from "../../link/link.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  title = 'Olivier Duval';
  links: LinkModel[] = [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/oduval/' },
    { label: 'Twitter', url: 'https://twitter.com/zorky'},
    { label: 'Devto', url: 'https://dev.to/zorky'}
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
