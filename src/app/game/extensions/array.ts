
interface Array<T> {
    contains(element: number);
}

Array.prototype.contains = function (element) {
    return this.some(p => p === element);
};
