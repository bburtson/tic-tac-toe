import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { PreGameMenu } from './pregame-menu.component';
import { GameBoardComponent } from './game/app-game-board.component';

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    PreGameMenu
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: PreGameMenu },
      { path: 'gameboard/:team', component: GameBoardComponent },
      { path: '**', redirectTo: '', pathMatch: 'full'}
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
