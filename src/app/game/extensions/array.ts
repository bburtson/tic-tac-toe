
interface Array<T>
{
    contains(element: number) : boolean
}
Array.prototype.contains = function (element : number) {
    return this.some(p => p === element);
};