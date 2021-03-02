import { of } from "rxjs/observable/of";
import { delay } from "rxjs/operators";

export const randomRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const wait = (ms: number) => of(null).pipe(delay(ms));
