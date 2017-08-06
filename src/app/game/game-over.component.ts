import { Component, Input, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameOverOptions } from '../models/GameOverOptions';
import {NgModel} from '@angular/forms';

@Component({
    selector:'game-over',
    templateUrl:'./game-over.component.html',
    styleUrls:['./game-board.component.css']
})
export class GameOver //implements OnInit
{    
    gameResults:any;
    public message:string;

    constructor(_route:ActivatedRoute)
    {
        this.gameResults = _route.snapshot.params; 
        this.message = this.buildMessage();
    }

    public buildMessage():string
    {
        console.log(this.gameResults);
        var msgStr;
        switch(this.gameResults.result)
        {
            case GameOverOptions.Cat:
                msgStr = 'Cat game! would you like to play again?';
                break;
            case GameOverOptions[1]:
                 msgStr = this.gameResults.playerTeam === 'x'? 'You win! nice job! play again?': 'You lose! play again?';
                break; 
            case GameOverOptions[2]:
                 msgStr = this.gameResults.playerTeam === 'o'? 'You win! nice job! play again?': 'You lose! play again?';
                break; 
        }
        return msgStr;
    }
}