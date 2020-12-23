import { LitElement } from 'lit-element';
/**
 * Renders the application.
 */
export declare class KApp extends LitElement {
    static styles: import("lit-element").CSSResult;
    version: string;
    enums: {
        [key: string]: unknown;
    };
    structs: {
        [key: string]: unknown;
    };
    ram: Array<{
        [key: string]: unknown;
    }>;
    query: string;
    generator: Generator<{
        row: number[];
        key: string;
    }, void, unknown> | undefined;
    constructor();
    private getVersionedData;
    private getVersions;
    fetchData(): Promise<void>;
    private inputHandler;
    private performSearch;
    search(query: string, data: Array<{
        [key: string]: unknown;
    }>, rowStart: number[]): Generator<{
        row: number[];
        key: string;
    }>;
    render(): import("lit-element").TemplateResult;
    changeHandler(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-app': KApp;
    }
}
//# sourceMappingURL=k-app.d.ts.map