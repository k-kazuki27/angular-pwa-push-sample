import 'rxjs/add/operator/catch';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class WebPushService {

  private API_URL: string;

  constructor(private http: HttpClient) {
    this.API_URL = 'http://localhost:8080';
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  addSubscriber(subscription) {

    const url = `${this.API_URL}/webpush`;
    console.log('[Push Service] Adding subscriber');

    const body = {
      action: 'subscribe',
      subscription: subscription
    };

    return this.http
      .post(url, body)
      .catch(this.handleError);

  }

  deleteSubscriber(subscription) {

    const url = `${this.API_URL}/register`;
    console.log('[Push Service] Deleting subscriber');

    const body = {
      action: 'unsubscribe',
      subscription: subscription
    };

    return this.http
      .post(url, body)
      .catch(this.handleError);

  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      errMsg = `${error.statusText || 'Network error'}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }
}
