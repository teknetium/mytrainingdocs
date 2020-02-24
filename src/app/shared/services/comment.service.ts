import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventService } from '../services/event.service';
import { EventModel } from '../interfaces/event.type';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private eventService: EventService) {
  }

}
