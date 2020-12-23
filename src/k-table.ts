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

  private getVersionedData(version: string) {
    return this.data.filter((item: {[key: string]: unknown}) => version in (item.addr as {[key: string]: string}));
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

  render() {
    return html`
      <div id="table">
        <div>
          ${this.getHeadings().map(heading => html`<span>${heading}</span>`)}
        </div>
        <div>
          ${(this.version ? this.getVersionedData(this.version) : this.data)
            .map((item: {[key: string]: unknown}, index: number) => {
              return html`<k-row
                  .data="${item}"
                  .structs="${this.structs}"
                  .enums="${this.enums}"
                  .version="${this.version}"
                  ?odd="${index % 2 == 0}"
                  ?isEnum="${this.isEnum}">
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
