import { TeamData } from './TeamData';
import { GameOverOptions } from './GameOverOptions';
export class PostGameData
{
    public teamData: TeamData
    public gameOverMessage:string;
    private _gameResult: GameOverOptions
    set gameResult(value:GameOverOptions)
    {
        this._gameResult = value;
        this.gameOverMessage = value === GameOverOptions.Cat ? 
        `${GameOverOptions[value]} game! play again?`:`${this._gameResult[value]} Wins!`; 
    }
    
    constructor(teamData: TeamData, gameResult: GameOverOptions) 
    {
        this.teamData = teamData;
        this.gameResult = gameResult;
    }
    
}