/// <reference path="../../../typings/globals/jquery/index.d.ts" />

export class Asset {
    loaded: boolean = false;
    data: any;
    constructor(public type: string, public name: string, public path: string) {
    }
    load = (callback: () => void) => {
        $.get(`assets/${this.path}`, (data: any) => {
            this.data = data;
            this.loaded = true;
            callback();
        }).fail(() => {
            console.error(`Failed to load asset ${this.path}.`);
        });
    }
}