import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileModel } from 'src/app/shared/interfaces/file.type';
import { FileManagerModule } from '../file-manager/file-manager.module';

@Component({
  selector: 'mtd-multi-selector',
  templateUrl: './multi-selector.component.html',
  styleUrls: ['./multi-selector.component.css']
})
export class MultiSelectorComponent implements OnInit {

  fromList: any[] = [];
  selectedList = [];
  toListBS$ = new BehaviorSubject<FileModel[]>([]);
  toList$ = this.toListBS$.asObservable();

  @Input() fromData;
  @Input() toList;

  constructor() { }

  ngOnInit() {
    this.fromList = this.fromData;
  }

  isSelected(i) {
    if (this.selectedList.includes(i)) {
      return true;
    } else {
      return false;
    }
  }

  selectItem(i) {
    if (this.selectedList.indexOf(i) >= 0) {
      this.selectedList.splice(this.selectedList.indexOf(i), 1);
    } else {
      this.selectedList.push(i);
    }
    console.log('selectItem', this.selectedList);
  }

  moveItemUp(i) {
    let removed: FileModel = this.toList.splice(i - 1, 1);
    this.toList.splice(i, 0, removed[0]);
    console.log('moveItemUp', removed, this.toList);
    this.toListBS$.next(this.toList);
  }

  moveItemDown(i) {
    let removed = this.toList.splice(i, 1);
    this.toList.splice(i + 1, 0, removed[0]);
    console.log('moveItemDown', removed, this.toList);
    this.toListBS$.next(this.toList);
  }

  addToList() {
    for (const item of this.selectedList) {
      this.toList.push(this.fromList[item]);
      this.fromList.splice(item, 1)
    }
    this.selectedList = [];
    this.toListBS$.next(this.toList);
  }

  removeFromList(i) {
    
  }
}
