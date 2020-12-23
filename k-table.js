var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, css } from 'lit-element';
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
    render() {
        return html `
      <div id="table">
        <div>
          ${this.getHeadings().map((heading, index) => html `<span class="${this.getClasses()[index]}">${heading}</span>`)}
        </div>
        <div>
          ${(this.version ? this.getVersionedData(this.version) : this.data)
            .map((item, index) => {
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

    span {
      box-sizing: border-box;
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
KTable = __decorate([
    customElement('k-table')
], KTable);
export { KTable };
//# sourceMappingURL=k-table.js.map