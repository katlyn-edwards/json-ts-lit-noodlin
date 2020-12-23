import { LitElement } from 'lit-element';
/**
 * Renders the application.
 */
export declare class KApp extends LitElement {
    static styles: import("lit-element").CSSResult;
    version: string;
    enums: Object;
    structs: Object;
    ram: Object[];
    constructor();
    private getVersions;
    fetchData(): Promise<void>;
    render(): import("lit-element").TemplateResult;
    changeHandler(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-app': KApp;
    }
}
//# sourceMappingURL=k-app.d.ts.map