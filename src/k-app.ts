import {css, customElement, html, LitElement, property} from 'lit-element';

/**
 * Renders the application.
 */
@customElement('k-app')
export class KApp extends LitElement {
  static styles = css`
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

  @property({type: String}) version = 'U';

  @property({type: Object}) enums: {[key: string]: unknown} = {};

  @property({type: Object}) structs: {[key: string]: unknown} = {};

  @property({type: Array}) ram: Array<{[key: string]: unknown}> = [];

  @property({type: Number}) resultCount = 0;

  @property({type: Number}) totalResults = 0;

  query = '';
  generator: Generator<{row: number[], key: string}, void, unknown>|undefined =
      undefined;

  constructor() {
    super();
    this.fetchData();
    document.body.addEventListener('keyup', (e: Event) => {
      if ((e as KeyboardEvent).key == 'Escape') {
        this.clearPreviousSearch();
      }
    })
  }

  private getVersionedData() {
    return this.ram.filter(
        (item: {[key: string]: unknown}) =>
            this.version in (item.addr as {[key: string]: string}));
  }

  private getVersions() {
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

  private inputHandler(e: Event) {
    if ((e as KeyboardEvent).key == 'Enter') {
      this.performSearch(this.shadowRoot?.querySelector('input')!.value || '');
    }
  }

  private searchButtonHandler() {
    this.performSearch(this.shadowRoot?.querySelector('input')!.value || '');
  }

  private findAllButtonHandler() {
    this.findAll(this.shadowRoot?.querySelector('input')!.value || '');
  }

  private findAll(query: string, highlight = true) {
    this.clearPreviousSearch();
    const gen = this.search(query, this.getVersionedData(), []);
    let result = gen.next().value;
    let resultCount = 0;
    while (result) {
      resultCount++;
      if (highlight) {
        this.shadowRoot?.querySelector('k-table')!.highlight(result, false);
      }
      result = gen.next().value;
    }
    return resultCount;
  }

  private clearPreviousSearch() {
    this.shadowRoot?.querySelector('k-table')!.clearHighlights();
  }

  private collapseAll() {
    this.shadowRoot?.querySelector('k-table')!.collapseAll();
  }

  private performSearch(query: string) {
    if (!query) {
      return;
    }

    this.clearPreviousSearch();
    if (query != this.query) {
      this.query = query;
      this.totalResults = this.findAll(query, false);
      this.generator = this.search(query, this.getVersionedData(), []);
    }
    const result = this.generator!.next().value;
    if (!result) {
      this.query = '';
      this.generator = undefined;
      this.resultCount = 0;
      this.totalResults = 0;
      return;
    }
    this.resultCount = this.resultCount + 1;
    // highlight that result
    this.shadowRoot?.querySelector('k-table')!.highlight(result);
  }

  *
      search(
          query: string, data: Array<{[key: string]: unknown}>,
          rowStart: number[]): Generator<{row: number[], key: string}> {
    for (let i = 0; i < data.length; i++) {
      let row = data[i] as {[key: string]: unknown};
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
        let searchable = (row[(thisKey as string)] as string);
        if (thisKey == 'addr') {
          searchable =
              (searchable as unknown as
               ({[key: string]: string}))[this.version];
        }
        if (searchable.toLowerCase().indexOf(query.toLowerCase()) != -1) {
          // This has the search term!
          yield {row: rowStart, key: thisKey};
        }
        if (thisKey == 'desc' &&
            ('enum' in row || row.type as string in this.structs)) {
          let isEnum = 'enum' in row;
          let expandName = isEnum ? row.enum as string : row.type as string;
          if (isEnum) {
            yield*
                this.search(
                    query,
                    this.enums[expandName] as Array<{[key: string]: unknown}>,
                    rowStart);
          } else {
            yield*
                this.search(
                    query,
                    (this.structs[expandName] as {[key: string]: unknown})
                            .vars as Array<{[key: string]: unknown}>,
                    rowStart);
          }
        }
      }
      rowStart.pop();
    }
  }

  getRenderedResultsCount(resultCount: number, totalResults: number) {
    return resultCount ? resultCount + ' of ' + totalResults : ''
  }

  render() {
    return html`
      <div>
        <h1>Metroid Fusion RAM Map</h1>
        <p id="version">
          Version:
          <select @change="${this.changeHandler}">
            ${
        this.getVersions().map(
            version => html`<option value="${version}">${version}</option>`)}
          </select>
          &nbsp;&nbsp;&nbsp;&nbsp;
          Search:
          <label data-results="${
        this.getRenderedResultsCount(this.resultCount, this.totalResults)}">
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
    this.version = this.shadowRoot!.querySelector('select')!.value
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-app': KApp;
  }
}
