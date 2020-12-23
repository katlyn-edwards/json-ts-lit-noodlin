var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, customElement, html, LitElement, property } from 'lit-element';
/**
 * Renders a table.
 */
let KTable = class KTable extends LitElement {
    constructor() {
        super(...arguments);
        /**
         * The JSON data to render.
         */
        this.data = [];
        this.structs = {};
        this.enums = {};
        this.version = '';
        this.isEnum = false;
        this.parentAddress = '';
    }
    getVersionedData(version) {
        return this.data.filter((item) => version in item.addr);
    }
    getClasses() {
        if (this.isEnum) {
            return ['addr', 'desc'];
        }
        return ['addr', 'size', 'desc'];
    }
    highlight(result, shouldScroll = true) {
        var _a;
        if (!result) {
            return;
        }
        let rowElement = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('k-row')[result.row[0]];
        if (result.row.length == 1) {
            rowElement.highlightCell(result.key, shouldScroll);
        }
        else {
            rowElement.highlightSubTable({ row: result.row.slice(1), key: result.key }, shouldScroll);
        }
    }
    clearHighlights() {
        var _a;
        let rows = Array.from((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('k-row'));
        rows.forEach(row => row.clearHighlights());
    }
    collapseAll() {
        var _a;
        let rows = Array.from((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelectorAll('k-row'));
        rows.forEach(row => row.collapseAll());
    }
    getHeadings() {
        if (this.version) {
            return ['Address', 'Length', 'Description'];
        }
        if (this.isEnum) {
            return ['Value', 'Description'];
        }
        else {
            return ['Offset', 'Size', 'Description'];
        }
    }
    getData() {
        const data = this.version ? this.getVersionedData(this.version) : this.data;
        if (this.sortFn) {
            let sortedData = data.slice();
            sortedData.sort(this.sortFn);
            return sortedData;
        }
        else {
            return data;
        }
    }
    maybeSort(e) {
        if (e.target.innerText.trim() == 'Description') {
            this.sortFn = (a, b) => {
                if (a.desc < b.desc) {
                    return -1;
                }
                else if (a.desc > b.desc) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
        }
        else {
            this.sortFn = undefined;
        }
    }
    render() {
        return html `
      <div id="table">
        <div>
          ${this.getHeadings().map((heading, index) => html `
              <span class="heading ${this.getClasses()[index]}"
                    @click="${this.maybeSort}">
                <span>
                  ${heading}
                </span>
                <span class="sort">
                  ${((this.sortFn && index == 2) || (!this.sortFn && index == 0)) ?
            html `▾` :
            html `&nbsp;&nbsp;`}
                </span>
              </span>`)}
        </div>
        <div>
          ${this.getData().map((item, index) => {
            return html `<k-row
                  .data="${item}"
                  .structs="${this.structs}"
                  .enums="${this.enums}"
                  .version="${this.version}"
                  ?odd="${index % 2 == 0}"
                  ?isEnum="${this.isEnum}"
                  .parentAddress="${this.parentAddress}">
                  </k-row>`;
        })}
        </div>
      </div>
    `;
    }
};
KTable.styles = css `
    :host {
      display: block;
    }

    .heading {
      box-sizing: border-box;
      cursor: pointer;
      display: inline-block;
      font-weight: 700;
      overflow: hidden;
      padding: 3px;
      text-overflow: ellipsis;
    }

    .size {
      text-align: right;
      width: 15%;
    }

    .addr {
      text-align: right;
      width: 20%;
    }

    .desc {
      width: 60%;
    }

    #table {
      margin: auto;
      max-width: 700px;
    }
  `;
__decorate([
    property({ type: Array })
], KTable.prototype, "data", void 0);
__decorate([
    property({ type: Object })
], KTable.prototype, "structs", void 0);
__decorate([
    property({ type: Object })
], KTable.prototype, "enums", void 0);
__decorate([
    property({ type: String, reflect: true })
], KTable.prototype, "version", void 0);
__decorate([
    property({ type: Boolean })
], KTable.prototype, "isEnum", void 0);
__decorate([
    property({ type: String })
], KTable.prototype, "parentAddress", void 0);
__decorate([
    property({ type: Function })
], KTable.prototype, "sortFn", void 0);
KTable = __decorate([
    customElement('k-table')
], KTable);
export { KTable };
//# sourceMappingURL=k-table.js.map