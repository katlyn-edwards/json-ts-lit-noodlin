import { LitElement } from 'lit-element';
/**
 * Renders a single row in a table.
 */
export declare class KRow extends LitElement {
    static styles: import("lit-element").CSSResult;
    /**
     * The JSON data to render.
     */
    data: {
        [key: string]: unknown;
    };
    structs: {
        [key: string]: unknown;
    };
    enums: {
        [key: string]: unknown;
    };
    version: string;
    odd: boolean;
    expanded: boolean;
    isEnum: boolean;
    private toHex;
    private getLength;
    private getCount;
    private getSize;
    private getTooltip;
    private showToggle;
    private expand;
    private isExpandEnum;
    private getExpandName;
    private getData;
    private getAddress;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-row': KRow;
    }
}
//# sourceMappingURL=k-row.d.ts.map