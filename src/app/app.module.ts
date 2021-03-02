import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { PreGameMenuComponent } from "./app-pregame-menu.component";
import { GameBoardComponent } from "./game/app-game-board.component";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
  declarations: [AppComponent, GameBoardComponent, PreGameMenuComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: "", component: PreGameMenuComponent },
      { path: "gameboard/:team", component: GameBoardComponent },
      { path: "**", redirectTo: "", pathMatch: "full" },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
