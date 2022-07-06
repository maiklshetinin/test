export interface IOptions {
    apiKey: string;
    q?: string;
    sources?: string;
}
export interface Iloader {
    options: IOptions;
    baseLink: string;
}

export enum RequestParams {
    sources = 'sources',
    everything = 'everything',
}
