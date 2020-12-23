var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, customElement, html, LitElement, property } from 'lit-element';
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
        this.resultCount = 0;
        this.totalResults = 0;
        this.query = '';
        this.generator = undefined;
        this.fetchData();
        document.body.addEventListener('keyup', (e) => {
            if (e.key == 'Escape') {
                this.clearPreviousSearch();
            }
        });
    }
    getVersionedData() {
        return this.ram.filter((item) => this.version in item.addr);
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
    inputHandler(e) {
        var _a;
        if (e.key == 'Enter') {
            this.performSearch(((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('input')).value || '');
        }
    }
    searchButtonHandler() {
        var _a;
        this.performSearch(((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('input')).value || '');
    }
    findAllButtonHandler() {
        var _a;
        this.findAll(((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('input')).value || '');
    }
    findAll(query, highlight = true) {
        var _a;
        this.clearPreviousSearch();
        const gen = this.search(query, this.getVersionedData(), []);
        let result = gen.next().value;
        let resultCount = 0;
        while (result) {
            resultCount++;
            if (highlight) {
                ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('k-table')).highlight(result, false);
            }
            result = gen.next().value;
        }
        return resultCount;
    }
    clearPreviousSearch() {
        var _a;
        ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('k-table')).clearHighlights();
    }
    collapseAll() {
        var _a;
        ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('k-table')).collapseAll();
    }
    performSearch(query) {
        var _a;
        if (!query) {
            return;
        }
        this.clearPreviousSearch();
        if (query != this.query) {
            this.query = query;
            this.totalResults = this.findAll(query, false);
            this.generator = this.search(query, this.getVersionedData(), []);
        }
        const result = this.generator.next().value;
        if (!result) {
            this.query = '';
            this.generator = undefined;
            this.resultCount = 0;
            this.totalResults = 0;
            return;
        }
        this.resultCount = this.resultCount + 1;
        // highlight that result
        ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('k-table')).highlight(result);
    }
    *search(query, data, rowStart) {
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let keys = Object.keys(row);
            // Remove "label" since it's not shown to users.
            let indexLabel = keys.findIndex((v) => v == 'label');
            if (indexLabel != -1) {
                keys.splice(indexLabel, 1);
            }
            // Remove "enum" since the values aren't shown to users.
            indexLabel = keys.findIndex((v) => v == 'enum');
            if (indexLabel != -1) {
                keys.splice(indexLabel, 1);
            }
            // Remove 'type' key matches, since those point to structs.
            indexLabel = keys.findIndex((v) => v == 'type');
            if (indexLabel != -1) {
                keys.splice(indexLabel, 1);
            }
            rowStart.push(i);
            for (let j = 0; j < keys.length; j++) {
                let thisKey = keys[j];
                let searchable = row[thisKey];
                if (thisKey == 'addr') {
                    searchable =
                        searchable[this.version];
                }
                if (searchable.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                    // This has the search term!
                    yield { row: rowStart, key: thisKey };
                }
                if (thisKey == 'desc' &&
                    ('enum' in row || row.type in this.structs)) {
                    let isEnum = 'enum' in row;
                    let expandName = isEnum ? row.enum : row.type;
                    if (isEnum) {
                        yield* this.search(query, this.enums[expandName], rowStart);
                    }
                    else {
                        yield* this.search(query, this.structs[expandName]
                            .vars, rowStart);
                    }
                }
            }
            rowStart.pop();
        }
    }
    getRenderedResultsCount(resultCount, totalResults) {
        return resultCount ? resultCount + ' of ' + totalResults : '';
    }
    render() {
        return html `
      <div>
        <h1>Metroid Fusion RAM Map</h1>
        <p id="version">
          Version:
          <select @change="${this.changeHandler}">
            ${this.getVersions().map(version => html `<option value="${version}">${version}</option>`)}
          </select>
          &nbsp;&nbsp;&nbsp;&nbsp;
          Search:
          <label data-results="${this.getRenderedResultsCount(this.resultCount, this.totalResults)}">
            <input @keyup='${this.inputHandler}'/>
          </label>
          <button @click="${this.searchButtonHandler}">Find</button>
          <button @click="${this.findAllButtonHandler}">Find All</button>
          <button @click="${this.clearPreviousSearch}">Clear results</button>
          <button @click="${this.collapseAll}">Collapse All</button>
        </p>
        <k-table
          .version="${this.version}"
          .data="${this.ram}"
          .structs="${this.structs}"
          .enums="${this.enums}"></k -
         table><
        /div>
    `;
    }
    changeHandler() {
        this.version = this.shadowRoot.querySelector('select').value;
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

    #version {
      background-color: white;
      margin: 0;
      padding: 20px 0;
      position: sticky;
      top: 0;
    }

    label,
    input {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      width: 170px;
      /** 170 - 115 left position below */
      padding-right: 55px;
    }

    label::after {
      content: attr(data-results);
      position: absolute;
      top: 4px;
      left: 115px;
      font-family: arial, helvetica, sans-serif;
      font-size: 12px;
      display: block;
      color: rgba(0, 0, 0, 0.6);
      font-weight: bold;
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
__decorate([
    property({ type: Number })
], KApp.prototype, "resultCount", void 0);
__decorate([
    property({ type: Number })
], KApp.prototype, "totalResults", void 0);
KApp = __decorate([
    customElement('k-app')
], KApp);
export { KApp };
//# sourceMappingURL=k-app.js.map