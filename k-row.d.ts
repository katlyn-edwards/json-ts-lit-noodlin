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
    parentAddress: string;
    private toHex;
    private getLength;
    highlightCell(key: string): Promise<void>;
    highlightSubTable(result: {
        row: number[];
        key: string;
    }): Promise<void>;
    private getCount;
    private getSize;
    private getTooltip;
    private getOffsetAddress;
    private showToggle;
    private expand;
    private isExpandEnum;
    private getExpandName;
    private getData;
    private getAddress;
    private shouldAddrHaveToolTip;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'k-row': KRow;
    }
}
//# sourceMappingURL=k-row.d.ts.map