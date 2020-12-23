import { LitElement } from 'lit-element';
/**
 * Renders a table.
 */
export declare class KTable extends LitElement {
    static styles: import("lit-element").CSSResult;
    /**
     * The JSON data to render.
     */
    data: never[];
    structs: {};
    enums: {
        [key: string]: unknown;
    };
    version: string;
    isEnum: boolean;
    private getVersionedData;
    private getHeadings;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-table': KTable;
    }
}
//# sourceMappingURL=k-table.d.ts.map