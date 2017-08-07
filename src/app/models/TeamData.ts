export class TeamData {

    private _playerTeam: string;

    set playerTeam(value: string) {

        this._playerTeam = value;

        this.aiTeam = this.playerTeam === 'x' ? 'o' : 'x';
    }

    get playerTeam(){ return this._playerTeam; }

    public aiTeam: string;

    constructor(playerTeam: string) {
        this.playerTeam  = playerTeam;
    }
}
