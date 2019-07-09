import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CoreModule } from '@symlink/core';
import { CommonModule } from '@symlink/common';
import { FormsModule } from '@symlink/forms';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, CommonModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
