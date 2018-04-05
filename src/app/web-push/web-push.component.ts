import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';

import { WebPushService } from '../web-push.service';

@Component({
  selector: 'app-web-push',
  templateUrl: './web-push.component.html',
  styleUrls: ['./web-push.component.css']
})
export class WebPushComponent implements OnInit {

  private VAPID_PUBLIC_KEY: string;
  constructor(private swPush: SwPush, private webPushService: WebPushService) {
  }

  ngOnInit() {
    this.VAPID_PUBLIC_KEY = '';
  }

  subscribeToPush() {

    // Requesting messaging service to subscribe current client (browser)
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(pushSubscription => {

        // Passing subscription object to our backend
        this.webPushService.addSubscriber(pushSubscription)
          .subscribe(
            res => {
              console.log('[App] Add subscriber request answer', res);
            },
            err => {
              console.log('[App] Add subscriber request failed', err);
            }
          );
      })
      .catch(err => {
        console.error(err);
      });
  }

  unsubscribeFromPush() {

    // Get active subscription
    this.swPush.subscription
      .subscribe(pushSubscription => {

        console.log('[App] pushSubscription', pushSubscription);

        // Delete the subscription from the backend
        this.webPushService.deleteSubscriber(pushSubscription)
          .subscribe(

            res => {
              console.log('[App] Delete subscriber request answer', res);
              // Unsubscribe current client (browser)
              pushSubscription.unsubscribe()
                .then(success => {
                  console.log('[App] Unsubscription successful', success);
                })
                .catch(err => {
                  console.log('[App] Unsubscription failed', err);
                });

            },
            err => {
              console.log('[App] Delete subscription request failed', err);
            }
          );
      });

  }

  showMessages() {
    this.swPush.messages
      .subscribe(message => {
        console.log('[App] Push message received', message);
        const notification = message['notification'];
        alert(notification);
      });
  }
}
