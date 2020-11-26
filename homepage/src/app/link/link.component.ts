import {Component, Input, OnInit} from '@angular/core';
import {LinkModel} from './link.model';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {
  @Input() link: LinkModel;
  constructor() { }

  ngOnInit(): void {
  }

}
