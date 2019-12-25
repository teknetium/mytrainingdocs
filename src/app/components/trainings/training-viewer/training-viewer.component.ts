import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../shared/services/training.service';
import { Observable } from 'rxjs';
import { TrainingModel } from 'src/app/shared/interfaces/training.type';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'mtd-training-viewer',
  templateUrl: './training-viewer.component.html',
  styleUrls: ['./training-viewer.component.css'],
  animations: [
    trigger('trainingToggle', [
      // ...
      state('closed', style({
      })),
      state('open', style({
        height: '900px',
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('* => open', [
        animate('700ms')
      ]),
    ])
  ]

})
export class TrainingViewerComponent implements OnInit {

  private selectedTraining$: Observable<TrainingModel>;
  private showEditor$: Observable<boolean>;
  private selectedTraining: TrainingModel;
  private currentPageId;
  isOpen = false;

  private items = [
    {
      name: 'toc-container',
    },
    {
      name: 'toc-title',
    },
    {
      name: 'toc-entry',
    },
    {
      name: 'main-content',
    },
    {
      name: 'page',
    }
  ]

  styleMap = new Map();
  constructor(private trainingService: TrainingService) { }

  ngOnInit() {
    this.selectedTraining$ = this.trainingService.getSelectedTrainingStream();
    this.showEditor$ = this.trainingService.getShowEditorStream();

    this.selectedTraining$.subscribe(
      res => {
        if (!res) {
          return;
        }

        this.selectedTraining = res;


      }
    );

    this.showEditor$.subscribe(
      res => {
        this.isOpen = res;
      }
    )


    for (const item of this.items) {

      console.log('adding to styleMap', item.name, this.styleMap);
      this.styleMap.set(item.name, new Map());
    }
    console.log('styleMap...', this.styleMap);

    this.styleMap.get('toc-container').set('width.%', 25);
    this.styleMap.get('main-content').set('width.%', 73);
    this.styleMap.get('toc-entry').set('width.%', 100);
    this.styleMap.get('toc-title').set('font-size.px', 18);
    this.styleMap.get('toc-title').set('margin-top.px', 10);
    this.styleMap.get('toc-title').set('color', 'red');
    this.styleMap.get('page').set('font-size.px', 26);
  }

  setCurrentPage(pageId) {
    console.log('setCurrentPage', pageId);
    this.currentPageId = pageId;
  }
}


