import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { SwPush } from '@angular/service-worker';
import { NotificationsService } from 'angular2-notifications';

import { WebPushService } from '../web-push.service';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-web-push',
  templateUrl: './web-push.component.html',
  styleUrls: ['./web-push.component.css']
})
export class WebPushComponent implements OnInit {

  private VAPID_PUBLIC_KEY: string;
  private snackBarDuration = 2000;

  constructor(private swPush: SwPush,
    private webPushService: WebPushService,
    public snackBar: MatSnackBar,
    private notificationService: NotificationsService) {
  }

  ngOnInit() {
    this.VAPID_PUBLIC_KEY = environment.VAPID_PUBLIC_KEY;
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
              const snackBarRef = this.snackBar.open('Now you are subscribed', null, {
                duration: this.snackBarDuration
              });
              this.receiveMessages();
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
      // .take(1)
      .subscribe(pushSubscription => {

        console.log('[App] pushSubscription', pushSubscription);

        // Delete the subscription from the backend
        this.webPushService.deleteSubscriber(pushSubscription)
          .subscribe(

            res => {
              console.log('[App] Delete subscriber request answer', res);

              const snackBarRef = this.snackBar.open('Now you are unsubscribed', null, {
                duration: this.snackBarDuration
              });

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

  private receiveMessages() {
    this.swPush.messages
      .subscribe(message => {

        console.log('[App] Push message received', message);
        const notification = message['notification'];
        const options = {
          timeOut: 3000,
          pauseOnHover: true,
          clickToClose: true,
          animate: 'fromRight'
        };
        this.notificationService.create(notification['title'], notification['msg'], 'success', options);
      });
  }
}
