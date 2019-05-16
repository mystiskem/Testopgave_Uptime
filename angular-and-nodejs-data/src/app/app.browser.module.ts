import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { FileListComponent } from './file-list/file-list.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [ ReactiveFormsModule, AppModule, BrowserTransferStateModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppBrowserModule {}
