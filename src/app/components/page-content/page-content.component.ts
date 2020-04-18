import { Component, OnInit, Input } from '@angular/core';
import { Content } from 'src/app/shared/interfaces/training.type';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.css']
})
export class PageContentComponent implements OnInit {

  @Input() data: Content = null;

  constructor() { }

  ngOnInit(): void {
  }

}
