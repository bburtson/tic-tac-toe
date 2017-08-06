import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { GameOverOptions } from '../models/GameOverOptions';
import { TeamData } from '../models/TeamData';
import { Position } from '../models/Position';
import { PostGameData } from '../models/PostGameData';
import './extensions/array';

@Component({
    selector: 'game-board',
    templateUrl: './game-board.component.html',
    styleUrls: ['./game-board.component.css']
})
export class GameBoard implements OnInit {
    private teamData: TeamData;    
    public gameOver:boolean = false;
    get isUsersTurn() { return this.teamData.playerTeam === this.currentTurn; }
    public turnCount: number = 0;
    public currentTurn: string = 'x';
    private readonly cornerPositions: number[] = [0, 2, 6, 8];
    private readonly edgePositions: number[] = [1, 3, 5, 7];
    private readonly winConditions: number[][] = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    public positions: Position[] = [new Position(0), new Position(1), new Position(2),
                                    new Position(3), new Position(4), new Position(5),
                                    new Position(6), new Position(7), new Position(8)];

    private userPositions: Array<Position> = new Array<Position>();
    private aiPositions: Array<Position> = new Array<Position>();
    private availableWinConditons: Array<number[]>;
    constructor(_route: ActivatedRoute, public router: Router) 
    {
        this.availableWinConditons = this.winConditions.slice();
        this.teamData = new TeamData(_route.snapshot.params['team']);
    }

    ngOnInit() 
    {
        this.positions.forEach(pos => 
        {
            pos.onPositionSet.subscribe((e) => this.toggleTurn());
        });

        if (!this.isUsersTurn) this.setAiPosition();
    }

    private toggleTurn() : void 
    {
        this.turnCount++;
        
        this.currentTurn = this.currentTurn === 'x' ? 'o' : 'x';
        
        if (!this.isUsersTurn) this.setAiPosition();
        
        this.checkGameState(this.userPositions);   
    }

    public setUserPosition(posValue: number): void 
    {
        if (this.isUsersTurn && this.positions[posValue].isOccupied === false) 
        {
            this.userPositions.push(this.positions[posValue]);

            this.positions[posValue].occupant = this.teamData.playerTeam;    
        }
    }

    public setAiPosition(): void 
    {
        var posNum = this.computeAiPosition();                
        //sets AI's position after some time to give some illusion that the AI is "thinking"
        //purely for user experience
        let timer = Observable.timer(1000, 1000).subscribe(seconds => 
        {    
            if(this.gameOver === true) timer.unsubscribe();
            
            if (seconds >= 1)
            {
                this.positions[posNum].occupant = this.teamData.aiTeam;
                this.aiPositions.push(this.positions[posNum]);
                this.checkGameState(this.aiPositions);
                timer.unsubscribe();             
            }
        });
    }
    //main processing pipeline for AI desicions
    //*** NOTE: all methods here return -1 if no respective position is found for each strategy
    public computeAiPosition() : number 
    {
        var position = this.computeFirstMove();
        //check if ai can win return -1 if no win positions available...
        if (position === -1) position = this.checkWinPositions(this.aiPositions, "ai");
        //attempt to trap or fork the user
        if (position === -1) position = this.computeTrapPositions();
        //defend against user traps / forks
        if (position === -1) position = this.computeTrapDefense();
        //simply just block the user if they have a possible win condition, (passing users positions here) 
        if (position === -1) position = this.checkWinPositions(this.userPositions, "user");
        //if nothing else matters then get a random spot.
        if (position === -1) position = this.generateRandomPosition();

        return position
    }

    private computeFirstMove() : number 
    {
        //Ai is first take the middle setting turncount for re-eval of trap/defense/offense
        if (this.aiPositions.length === 0 && this.turnCount === 0) { this.turnCount--; return 4 };
        //setup to avoid traps/fork strategies
        if (this.turnCount === 1)
        {
            //if user took center, ai will take a corner taking 6 just for simplicty
            if (this.userPositions[0].position === 4) return 6;
            //if user took corner ai takes center
            if (this.userPositions[0].isCorner && this.aiPositions.length === 0) return 4;
        }
        //no control was hit for other return statements so return -1 
        //to evaluate additional strategies in the calling method...
        return -1;
    }

    //checks for possible positions that would result it a win and removes it from possible conditions array
    private checkWinPositions(playerPositions: Array<Position>, entity: string): number 
    {
        let matches = this.resolvePossibleMatches(playerPositions);

        let returnPosition: number, result: number;

        matches.forEach((obj) => 
        {
            result = this.removePossibleWinCondition(obj.condition, obj.matchedVals);

            if (!this.positions[result].isOccupied) returnPosition = result;
        });

        return returnPosition !== undefined ? returnPosition : -1;
    }

    private computeTrapPositions(): number 
    {
        if (this.turnCount === 1) 
        {
            if (this.userPositions[0].isEdge) 
            {
                switch (this.userPositions[0].position) 
                {
                    case 1: return 6;
                    case 3: return 8;
                    case 5: return 0;
                    case 7: return 2;
                }
            }
            if (this.userPositions[0].isCorner) 
            {
                switch (this.userPositions[0].position) 
                {
                    case 0: return 8;
                    case 2: return 6;
                    case 6: return 2;
                    case 8: return 0;
                }
            }
        }
        return -1;
    }

    private computeTrapDefense() : number 
    {
        var pos = this.checkWinPositions(this.userPositions, "user");

        if (this.turnCount === 3 && this.aiPositions.length === 1) 
        {
            if (this.userPositions.every(p => p.isCorner)) return pos === -1 ? 1 : pos;
            else if (pos === -1) 
            {
                this.positions.forEach(p => 
                {
                    pos = p.isCorner && !p.isOccupied ? p.position : -1;
                });
            }
        }
        return pos;
    }

    private generateRandomPosition(): number 
    {
        let pos;
        //stop infinite loop remove later when end-game branches control flow
        if (this.positions.some(p => p.isOccupied === false)) 
        {
            do 
            {
                pos = Math.floor(Math.random() * this.positions.length);
            }
            while (this.positions[pos].isOccupied === true)
        }
        return pos;
    }

    private removePossibleWinCondition(conditionArray: number[], twoOfThree: number[]): number 
    {
        let index = conditionArray.indexOf(twoOfThree[0]);

        conditionArray.splice(index, 1);

        index = conditionArray.indexOf(twoOfThree[1]);

        conditionArray.splice(index, 1);

        index = conditionArray[0];

        return index;
    }

    private resolvePossibleMatches(playerPositions: Array<Position>): Array<any> 
    {
        var matches = new Array<any>();

        for (let row of this.availableWinConditons) 
            {
                var match = row.reduce((acc, cur) => 
                {
                    if(playerPositions.some(p=>p.position === cur)) acc.push(cur);
                    return acc;
                }, []);

                if (match.length == 2) matches.push({ matchedVals: match, condition: row });
        }
        return matches;
    }
    //checking for a winner not in the context of any AI computations... 
    //For advancing user thorugh the application.. (game over)
    private checkGameState(playerPositions:Array<Position>) : void
    {
        if(!this.gameOver)
        {

            for(let permutation of this.winConditions)
            {
                var currentWinPositions = permutation.reduce((acc,cur) => 
                {
                    if(playerPositions.some(p=>p.position === cur)) acc.push(cur);
                    return acc;
                },[]);
            
                if(currentWinPositions.length > 2) 
                {
                    for(var i = 0; i < this.positions.length; i++)
                   {   
                        if(!currentWinPositions.some(p => p === this.positions[i].position))
                        {     
                            this.positions[i].setOpacityClass();            
                        }
                    }
                    this.endGame(GameOverOptions[playerPositions[0].occupant]);
                }
            }
        
            if(this.aiPositions.length + this.userPositions.length === 9) this.endGame(GameOverOptions.Cat);
        }
    }

    private endGame(gameResult: GameOverOptions): void 
    {
        this.gameOver = true;

        var timer = Observable.timer(1000,1000).subscribe((s) =>
        {
            if(s === 3) this.router.navigate(['/']);    
        });
        
    }

    public setClass(entity: string) 
    {
        var team = entity === 'player' ? this.teamData.playerTeam : this.teamData.aiTeam;

        let classes = { x: team === 'x', o: team === 'o', turn: this.currentTurn === team };

        return classes;
    }
} 