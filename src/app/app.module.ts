import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { WebPushService } from './web-push.service';
import { WebPushComponent } from './web-push/web-push.component';

@NgModule({
  declarations: [
    AppComponent,
    WebPushComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [WebPushService],
  bootstrap: [AppComponent]
})
export class AppModule { }
