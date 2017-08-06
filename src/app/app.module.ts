import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA  } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AppComponent } from './app.component';
import { PreGameMenu } from './pregame-menu.component';
import { GameBoard } from './game/game-board.component';
import { GameOver } from './game/game-over.component';

@NgModule({
  declarations: [
    AppComponent,
    GameBoard,
    PreGameMenu,
    GameOver
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: '', component: PreGameMenu },
      { path: 'gameboard/:team', component: GameBoard },
      { path: 'score/:result', component: GameOver },
      { path: '**', redirectTo: '', pathMatch: 'full'} 
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
