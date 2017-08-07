import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PreGameMenuComponent } from './app-pregame-menu.component';
import { GameBoardComponent } from './game/app-game-board.component';

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    PreGameMenuComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: PreGameMenuComponent },
      { path: 'gameboard/:team', component: GameBoardComponent },
      { path: '**', redirectTo: '', pathMatch: 'full'}
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
