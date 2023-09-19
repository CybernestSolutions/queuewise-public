import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MiddleScreenComponent } from './middle-screen/middle-screen.component';
import { BottomScreenComponent } from './bottom-screen/bottom-screen.component';
import { RightSideScreenComponent } from './right-side-screen/right-side-screen.component';
import { LeftSideScreenComponent } from './left-side-screen/left-side-screen.component';
import { MainComponent } from './main/main.component';
import { ProcessingNumbersComponent } from './left-side-screen/processing-numbers/processing-numbers.component';
import { NextNumbersComponent } from './right-side-screen/next-numbers/next-numbers.component';
import { TimeComponent } from './right-side-screen/time/time.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MiddleScreenComponent,
    BottomScreenComponent,
    RightSideScreenComponent,
    LeftSideScreenComponent,
    MainComponent,
    ProcessingNumbersComponent,
    NextNumbersComponent,
    TimeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
