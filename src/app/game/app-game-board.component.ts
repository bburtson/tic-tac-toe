import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import "rxjs/add/observable/timer";
import { TeamData } from "../models/TeamData";
import { Position } from "../models/Position";
import { ActivatedRoute, Router } from "@angular/router";
import { randomRange, wait } from "../util";
import { of } from "rxjs/observable/of";

@Component({
  selector: "app-game-board",
  templateUrl: "./app-game-board.component.html",
  styleUrls: ["./app-game-board.component.css"],
})
export class GameBoardComponent implements OnInit {
  public teamData = new TeamData(this._route.snapshot.params["team"]);
  public gameOver = false;
  public turnCount = 0;
  public currentTurn = "x";
  get isUsersTurn() {
    return this.teamData.playerTeam === this.currentTurn;
  }
  private readonly cornerPositions: number[] = [0, 2, 6, 8];
  private readonly edgePositions: number[] = [1, 3, 5, 7];
  private readonly winConditions: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  public positions: Position[] = [
    new Position(0),
    new Position(1),
    new Position(2),
    new Position(3),
    new Position(4),
    new Position(5),
    new Position(6),
    new Position(7),
    new Position(8),
  ];

  private userPositions: Array<Position> = new Array<Position>();
  private aiPositions: Array<Position> = new Array<Position>();

  private availableWinConditons: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  private readonly _positionOperators = [
    () => this.computeFirstMove(),
    () => this.checkWinPositions(this.aiPositions),
    () => this.computeTrapPositions(),
    () => this.computeTrapDefense(),
    () => this.checkWinPositions(this.userPositions),
    () => this.generateRandomPosition(),
  ];
  constructor(private _route: ActivatedRoute, public router: Router) {}

  ngOnInit() {
    this.positions.forEach((pos) => {
      pos.onPositionSet.subscribe((e) => {
        this.toggleTurn();
      });
    });

    if (!this.isUsersTurn) {
      this.setAiPosition();
    }
  }

  private toggleTurn(): void {
    this.turnCount++;
    this.currentTurn = this.currentTurn === "x" ? "o" : "x";
    if (!this.isUsersTurn) {
      this.setAiPosition();
    }
  }

  public setUserPosition(posValue: number): void {
    if (this.isUsersTurn && this.positions[posValue].isOccupied === false) {
      this.userPositions.push(this.positions[posValue]);
      this.positions[posValue].occupant = this.teamData.playerTeam;
      this.checkGameState(this.userPositions);
    }
  }

  public setAiPosition(): void {
    const posNum = this.computeAiPosition();
    // sets AI's position after some time to give some illusion that the AI is "thinking"
    // purely for user experience
    wait(randomRange(400, 1200)).subscribe(() => {
      this.positions[posNum].occupant = this.teamData.aiTeam;
      this.aiPositions.push(this.positions[posNum]);
      this.checkGameState(this.aiPositions);
    });
  }

  computeAiPosition() {
    for (let i = 0; i < this._positionOperators.length; i++) {
      const position = this._positionOperators[i].call(null);
      if (position > -1) return position;
    }
  }

  private computeFirstMove(): number {
    // Ai is first take the middle setting turncount to force re-eval of trap/defense/offense
    if (this.aiPositions.length === 0 && this.turnCount === 0) {
      this.turnCount--;
      return 4;
    }
    // setup to avoid traps/fork strategies
    if (this.turnCount === 1) {
      // if user took center, ai will take a corner taking 6 just for simplicty
      if (this.userPositions[0].position === 4) {
        return 6;
      }
      // if user took corner ai takes center
      if (this.userPositions[0].isCorner && this.aiPositions.length === 0) {
        return 4;
      }
    }
    // no control was hit for other return statements so return -1
    // to evaluate additional strategies in the calling method...
    return -1;
  }

  // checks for possible positions that would result it a win and removes it from possible conditions array
  private checkWinPositions(playerPositions: Array<Position>): number {
    const matches = this.resolvePossibleMatches(playerPositions);
    let returnPosition: number, result: number;
    matches.forEach((obj) => {
      result = this.removePossibleWinCondition(obj.condition, obj.matchedVals);

      if (!this.positions[result].isOccupied) {
        returnPosition = result;
      }
    });
    return returnPosition !== undefined ? returnPosition : -1;
  }

  private computeTrapPositions(): number {
    if (this.turnCount === 1) {
      if (this.userPositions[0].isEdge) {
        switch (this.userPositions[0].position) {
          case 1:
            return 6;
          case 3:
            return 8;
          case 5:
            return 0;
          case 7:
            return 2;
        }
      }
      if (this.userPositions[0].isCorner) {
        switch (this.userPositions[0].position) {
          case 0:
            return 8;
          case 2:
            return 6;
          case 6:
            return 2;
          case 8:
            return 0;
        }
      }
    }
    return -1;
  }

  private computeTrapDefense(): number {
    let pos = this.checkWinPositions(this.userPositions);
    if (this.turnCount === 3 && this.aiPositions.length === 1) {
      if (this.userPositions.every((p) => p.isCorner)) {
        return pos === -1 ? 1 : pos;
      } else if (pos === -1) {
        this.positions.forEach((p) => {
          pos = p.isCorner && !p.isOccupied ? p.position : -1;
        });
      }
    }
    return pos;
  }

  private generateRandomPosition(): number {
    let pos;
    do {
      pos = Math.floor(Math.random() * this.positions.length);
    } while (this.positions[pos].isOccupied === true);
    return pos;
  }

  private removePossibleWinCondition(
    conditionArray: number[],
    twoOfThree: number[]
  ): number {
    let index = conditionArray.indexOf(twoOfThree[0]);
    conditionArray.splice(index, 1);
    index = conditionArray.indexOf(twoOfThree[1]);
    conditionArray.splice(index, 1);
    index = conditionArray[0];
    return index;
  }

  private resolvePossibleMatches(playerPositions: Array<Position>): Array<any> {
    const matches = new Array<any>();
    for (const row of this.availableWinConditons) {
      const match = row.reduce((acc, cur) => {
        if (playerPositions.some((p) => p.position === cur)) {
          acc.push(cur);
        }
        return acc;
      }, []);
      if (match.length === 2) {
        matches.push({ matchedVals: match, condition: row });
      }
    }
    return matches;
  }
  // checking for a winner not in the context of any AI computations...
  // For advancing user thorugh the application.. (game over)
  private checkGameState(playerPositions: Array<Position>): void {
    if (!this.gameOver) {
      for (const permutation of this.winConditions) {
        const winningPositions = permutation.reduce((acc, cur) => {
          if (playerPositions.some((p) => p.position === cur)) {
            acc.push(cur);
          }
          return acc;
        }, []);

        if (winningPositions.length > 2) {
          this.endGame(winningPositions);
        }
      }

      if (this.aiPositions.length + this.userPositions.length === 8) {
        this.endGame();
      }
    }
  }

  private endGame(winningPositions?: any): void {
    this.gameOver = true;
    if (winningPositions) {
      for (let i = 0; i < this.positions.length; i++) {
        if (!winningPositions.some((p) => p === this.positions[i].position)) {
          this.positions[i].setOpacityClass();
        }
      }
    } else {
      this.positions.forEach((p) => p.setOpacityClass());
    }
    wait(2000).subscribe(() => {
      console.log("HELLO!");
      const url = `/gameboard/${this.teamData.playerTeam}`;
      this.router.navigate(["/"]).then(() => this.router.navigate([url]));
    });
  }

  public setClass(entity: string) {
    const team =
      entity === "player" ? this.teamData.playerTeam : this.teamData.aiTeam;
    const classes = {
      x: team === "x",
      o: team === "o",
      turn: this.currentTurn === team,
    };
    return classes;
  }
}
