import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { FileListComponent } from './file-list/file-list.component';
import { CommonModule } from '@angular/common';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { HttpClientModule } from '@angular/common/http';
import { NgtUniversalModule } from '@ng-toolkit/universal';

@NgModule({
  declarations: [AppComponent, FileUploaderComponent, FileListComponent],
  imports: [BrowserModule.withServerTransition({ appId: 'serverApp' }), ReactiveFormsModule, CommonModule, TransferHttpCacheModule, HttpClientModule, NgtUniversalModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
