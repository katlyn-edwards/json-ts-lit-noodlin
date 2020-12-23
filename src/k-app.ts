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
  `;

  @property({type: String}) version = 'U';

  @property({type: Object}) enums: {[key: string]: unknown} = {};

  @property({type: Object}) structs: {[key: string]: unknown} = {};

  @property({type: Array}) ram: Array<{[key: string]: unknown}> = [];

  query = '';
  generator: Generator<{row: number[], key: string}, void, unknown>|undefined =
      undefined;

  constructor() {
    super();
    this.fetchData();
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

  private performSearch(query: string) {
    if (!query) {
      return;
    }

    if (query != this.query) {
      console.log('new search term');
      this.query = query;
      this.generator = this.search(query, this.getVersionedData(), []);
    }
    const result = this.generator!.next().value;
    console.log(`I got a result!`)
    console.log(result);
    if (!result) {
      this.query = '';
      this.generator = undefined;
      return;
    }
    // highlight that result
    this.shadowRoot?.querySelector('k-table')!.highlight(result);
  }

  *
      search(
          query: string, data: Array<{[key: string]: unknown}>,
          rowStart: number[]): Generator<{row: number[], key: string}> {
    console.log(`search data: `)
    console.log(data);
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
          console.log(`this is the match! ${searchable}`)
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
          <input @keyup="${this.inputHandler}"/>
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
    this.version = this.shadowRoot!.querySelector('select')!.value
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-app': KApp;
  }
}
