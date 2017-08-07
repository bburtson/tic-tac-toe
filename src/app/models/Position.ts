import { EventEmitter, Output } from '@angular/core';


export class Position {

    @Output() onPositionSet = new EventEmitter<Position>();
    // bound to ngClass to display gamepieces through CSS
    private _occupant: string;

    get isOccupied(): boolean { return this._occupant !== undefined; }

    get isEdge(): boolean { return [1, 3, 5, 7].some(p => p === this.position); }

    get isCorner(): boolean { return [0, 2, 6, 8].some(p => p === this.position); }

    get occupant() { return this._occupant; }

    set occupant(value: string) {

        if (!this.isOccupied) {

            this._occupant = value;

            this.onPositionSet.emit(this);
        }
    }

    public setOpacityClass(): void { this._occupant += ' dim'; }

    constructor(public position: number) { }
}
