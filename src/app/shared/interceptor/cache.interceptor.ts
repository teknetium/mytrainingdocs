import { HttpClient, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef, Injectable } from '@angular/core';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const httpRequest = req.clone({
            headers: new HttpHeaders({
                'Cache-Control': 'no-store, no-cache'
            })
        });

        
        return next.handle(httpRequest);
    }
}