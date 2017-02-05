export class Util {
    static async(list: any[], process: (item: any, callback: () => void) => void, callback: () => void): void {
        (function next(i: number): void {
            if (i < list.length) {
                process(list[i], (): void => {
                    next(i + 1);
                });
            } else {
                callback();
            }
        })(0);
    }
}