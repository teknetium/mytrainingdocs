import { Injectable } from '@angular/core';
import { CommentModel } from '../interfaces/comment.type';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';

@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {


  constructor(private eventService: EventService) {
  }

  markTrainingAsComplete(tid, uid) {

  }

}
