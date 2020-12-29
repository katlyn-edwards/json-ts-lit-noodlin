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
    resultCount: number;
    totalResults: number;
    noResults: boolean;
    query: string;
    generator: Generator<{
        row: number[];
        key: string;
    }, void, unknown> | undefined;
    seenResults: Array<{
        row: number[];
        key: string;
    }>;
    constructor();
    private getVersionedData;
    private getVersions;
    fetchData(): Promise<void>;
    private inputHandler;
    private searchButtonHandler;
    private findAllButtonHandler;
    private findAll;
    private clearPreviousSearch;
    private collapseAll;
    private performSearch;
    search(query: string, data: Array<{
        [key: string]: unknown;
    }>, rowStart: number[]): Generator<{
        row: number[];
        key: string;
    }>;
    getRenderedResultsCount(resultCount: number, totalResults: number, noResults: boolean): string;
    render(): import("lit-element").TemplateResult;
    changeHandler(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-app': KApp;
    }
}
//# sourceMappingURL=k-app.d.ts.map