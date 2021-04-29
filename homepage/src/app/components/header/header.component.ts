import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() layout = 'start center';
  constructor(private router: Router) { }

  ngOnInit(): void {
   }
  ngOnDestroy(): void {
  }
}
