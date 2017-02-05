export class Util {
    static async(list: any[], process: (item: any, callback: () => void) => void, callback: () => void) {
        (function next(i: number) {
            if (i < list.length) {
                process(list[i], function () {
                    next(i + 1);
                });
            } else {
                callback();
            }
        })(0);
    }
}