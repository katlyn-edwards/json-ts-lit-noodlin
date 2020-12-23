var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, customElement, property, css } from 'lit-element';
/**
 * Renders the application.
 */
let KApp = class KApp extends LitElement {
    constructor() {
        super();
        this.version = 'U';
        this.enums = {};
        this.structs = {};
        this.ram = [];
        this.fetchData();
    }
    getVersions() {
        return ['U', 'J'];
    }
    async fetchData() {
        // TODO(katlyn): You can remove the proxy once hosting.
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetBaseUrl = 'http://labk.org/maps/mf/json/';
        this.enums = await fetch(proxyUrl + targetBaseUrl + 'enums.json')
            .then(response => response.json());
        this.structs = await fetch(proxyUrl + targetBaseUrl + 'structs.json')
            .then(response => response.json());
        this.ram = await fetch(proxyUrl + targetBaseUrl + 'ram.json')
            .then(response => response.json());
    }
    render() {
        return html `
      <div>
        <h1>Metroid Fusion RAM Map</h1>
        <p id="version">
          Version:
          <select @change="${this.changeHandler}">
            ${this.getVersions()
            .map(version => html `<option value="${version}">${version}</option>`)}
          </select>
        </p>
        <k-table
          .version="${this.version}"
          .data="${this.ram}"
          .structs="${this.structs}"
          .enums="${this.enums}"></k-table>
      </div>
    `;
    }
    changeHandler() {
        this.version = this.shadowRoot.querySelector("select").value;
    }
};
KApp.styles = css `
    :host {
      display: block;
    }

    h1,
    #version {
      text-align: center;
    }
  `;
__decorate([
    property({ type: String })
], KApp.prototype, "version", void 0);
__decorate([
    property({ type: Object })
], KApp.prototype, "enums", void 0);
__decorate([
    property({ type: Object })
], KApp.prototype, "structs", void 0);
__decorate([
    property({ type: Array })
], KApp.prototype, "ram", void 0);
KApp = __decorate([
    customElement('k-app')
], KApp);
export { KApp };
//# sourceMappingURL=k-app.js.map