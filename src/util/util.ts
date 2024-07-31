export function isClass(
    value: unknown
): value is abstract new (...args: any[]) => any {
    if (typeof value !== 'function') return false;

    const prototype = Object.getPrototypeOf(value);

    const funcIsClass =
        prototype &&
        prototype !== Function.prototype &&
        typeof prototype.constructor === 'function';

    return funcIsClass;
}

export function isSubclassOf<
    Superclass extends abstract new (...args: any[]) => any
>(
    value: abstract new (...args: any[]) => any,
    parent: Superclass
): value is Superclass {
    return value.prototype instanceof parent;
}

export function toOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = n % 100;
    return n + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}
