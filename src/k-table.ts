import {LitElement, html, customElement, property, css} from 'lit-element';

/**
 * Renders a table.
 */
@customElement('k-table')
export class KTable extends LitElement {
  static styles = css`
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

  /**
   * The JSON data to render.
   */
  @property({type: Array})
  data = [];

  @property({type: Object})
  structs = {};

  @property({type: Object})
  enums = {} as {[key: string]: unknown};

  @property({type: String, reflect: true})
  version = '';

  @property({type: Boolean})
  isEnum = false;

  @property({type: String})
  parentAddress = '';

  @property({type: Function})
  sortFn?: ((a: any, b: any) => number)|undefined;

  private getVersionedData(version: string) {
    return this.data.filter((item: {[key: string]: unknown}) => version in (item.addr as {[key: string]: string}));
  }

  private getClasses() {
    if (this.isEnum) {
      return ['addr', 'desc']
    }
    return ['addr', 'size', 'desc'];
  }

  highlight(result: {row: number[], key: string}|void) {
    if (!result) {
      return;
    }
    if (result.row.length == 1) {
      let rowElement = this.shadowRoot?.querySelectorAll('k-row')[result.row[0]];
      rowElement!.highlightCell(result.key);
    } else {
      // that row should expand, and recurse?
      console.log(result.row);
    }
  }

  private getHeadings() {
    if (this.version) {
      return ['Address', 'Length', 'Description'];
    }
    if (this.isEnum) {
      return ['Value', 'Description'];
    } else {
      return ['Offset', 'Size', 'Description'];
    }
  }

  private getData() {
    const data = this.version ? this.getVersionedData(this.version) : this.data;
    if (this.sortFn) {
      let sortedData = data.slice();
      sortedData.sort(this.sortFn!);
      return sortedData;
    } else {
      return data;
    }
  }

  private maybeSort(e: Event) {
    if ((e.target as HTMLElement).innerText.trim() == 'Description') {
      this.sortFn = (a: {desc: string}, b: {desc: string}) => {
        if (a.desc < b.desc) {
          return -1;
        } else if (a.desc > b.desc) {
          return 1;
        } else {
          return 0;
        }
      }
    } else {
      this.sortFn = undefined;
    }
  }

  render() {
    return html`
      <div id="table">
        <div>
          ${this.getHeadings().map((heading, index) => html`
              <span class="heading ${this.getClasses()[index]}"
                    @click="${this.maybeSort}">
                <span>
                  ${heading}
                </span>
                <span class="sort">
                  ${((this.sortFn && index == 2) || (!this.sortFn && index == 0)) ? html`▾` : html`&nbsp;&nbsp;`}
                </span>
              </span>`)}
        </div>
        <div>
          ${this.getData()
            .map((item: {[key: string]: unknown}, index: number) => {
              return html`<k-row
                  .data="${item}"
                  .structs="${this.structs}"
                  .enums="${this.enums}"
                  .version="${this.version}"
                  ?odd="${index % 2 == 0}"
                  ?isEnum="${this.isEnum}"
                  .parentAddress="${this.parentAddress}">
                  </k-row>`;
            })
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-table': KTable;
  }
}
