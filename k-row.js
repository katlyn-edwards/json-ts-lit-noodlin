var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, customElement, html, LitElement, property } from 'lit-element';
/**
 * Renders a single row in a table.
 */
let KRow = class KRow extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * The JSON data to render.
         */
        this.data = {};
        this.structs = {};
        this.enums = {};
        this.version = '';
        this.odd = false;
        this.expanded = false;
        this.isEnum = false;
        this.parentAddress = '';
    }
    toHex(num) {
        return num.toString(16).toUpperCase();
    }
    getLength() {
        const size = this.getSize();
        const count = this.getCount();
        const length = size * count;
        return this.toHex(length);
    }
    async highlightCell(key) {
        var _a;
        if (key == 'enum') {
            this.expanded = true;
        }
        await this.requestUpdate();
        let element = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.' + key);
        element.scrollIntoView();
        element.style.backgroundColor = 'lightblue';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 3000);
    }
    async highlightSubTable(result) {
        var _a;
        this.expanded = true;
        await this.requestUpdate();
        let table = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('k-table');
        table.highlight(result);
    }
    getCount() {
        return 'count' in this.data ? parseInt(this.data.count, 16) : 1;
    }
    getSize() {
        let size;
        if (this.data.size) {
            size = parseInt(this.data.size, 16);
        }
        else {
            switch (this.data.type) {
                case 'u8':
                case 's8':
                case 'flags8':
                    size = 1;
                    break;
                case 'u16':
                case 's16':
                case 'flags16':
                    size = 2;
                    break;
                case 'u32':
                case 's32':
                case 'pointer':
                    size = 4;
                    break;
                default:
                    size = parseInt(this.structs[this.data.type].size, 16);
                    break;
            }
        }
        return size;
    }
    getTooltip() {
        if (this.version) {
            const count = this.getCount();
            if (count > 1) {
                const size = this.getSize();
                return 'Size: ' + this.toHex(size) + '\nCount: ' + this.toHex(count);
            }
            return '';
        }
        else {
            return 'Address: ' + this.getOffsetAddress();
        }
    }
    getOffsetAddress() {
        let off = parseInt(this.data.offset, 16);
        return this.toHex(parseInt(this.parentAddress, 16) + off);
    }
    showToggle() {
        return (this.isExpandEnum() || this.data.type in this.structs);
    }
    expand() {
        this.expanded = !this.expanded;
    }
    isExpandEnum() {
        return 'enum' in this.data;
    }
    getExpandName() {
        return this.isExpandEnum() ? this.data.enum :
            this.data.type;
    }
    getData() {
        if (this.isExpandEnum()) {
            return this.enums[this.getExpandName()];
        }
        return this.structs[this.getExpandName()]
            .vars;
    }
    getAddress() {
        if (this.version) {
            return this.data.addr[this.version];
        }
        return this.data.offset;
    }
    shouldAddrHaveToolTip() {
        return !this.version;
    }
    render() {
        return this.isEnum ?
            html `
      <div class="addr val">${this.data.val}</div>
      <div class="desc">${this.data.desc}</div>` :
            html `
      <div class="addr offset">
        <span class="${this.shouldAddrHaveToolTip() ? 'has-tooltip' : ''}"
              title="${this.shouldAddrHaveToolTip() ? this.getTooltip() :
                ''}">${this.getAddress()}</span>
      </div>
      <div class="size">
        <span class="${this.version && !!this.getTooltip() ? 'has-tooltip' : ''}"
              title="${this.getTooltip()}">${this.getLength()}</span>
      </div>
      <div class="desc">${this.data.desc} ${this.showToggle() ?
                html `<span class="expand" @click="${this.expand}">[${this.expanded ? '-' : '+'}]</span>` :
                ''}
          ${this.expanded ? html `<k-table
              .data="${this.getData()}"
              ?isEnum="${this.isExpandEnum()}"
              .structs="${this.structs}"
              .enums="${this.enums}"
              .parentAddress="${this.version ? this.getAddress() :
                this.getOffsetAddress()}">
            </k-table>` :
                ''}
      </div>
    `;
    }
};
KRow.styles = css `
    :host {
      background: var(--k-gray);
      border: 1px solid var(--k-black);
      display: flex;

      --k-blue: #2196F3;
      --k-gray: #F5F5F5;
      --k-black: #999999;
    }

    :host([odd]) {
      background: white;
    }

    div:not(:last-child) {
      border-right: 1px solid var(--k-black);
    }

    div {
      box-sizing: border-box;
      display: inline-block;
      overflow: hidden;
      padding: 3px;
      text-overflow: ellipsis;
    }

    .size {
      flex: none;
      text-align: right;
      width: 15%;
    }

    .addr {
      flex: none;
      font-family: "Courier New", monospace;
      text-align: right;
      width: 20%;
    }

    .desc {
      flex: 1;
    }

    .has-tooltip {
      border-bottom: 1px dotted black;
      cursor: help;
    }

    .expand {
      cursor: pointer;
      text-decoration: underline;
      color: var(--k-blue);
    }
  `;
__decorate([
    property({ type: Object })
], KRow.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], KRow.prototype, "structs", void 0);
__decorate([
    property({ type: Object })
], KRow.prototype, "enums", void 0);
__decorate([
    property({ type: String })
], KRow.prototype, "version", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], KRow.prototype, "odd", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], KRow.prototype, "expanded", void 0);
__decorate([
    property({ type: Boolean })
], KRow.prototype, "isEnum", void 0);
__decorate([
    property({ type: String })
], KRow.prototype, "parentAddress", void 0);
KRow = __decorate([
    customElement('k-row')
], KRow);
export { KRow };
//# sourceMappingURL=k-row.js.map