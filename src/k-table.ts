import {css, customElement, html, LitElement, property} from 'lit-element';

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
      width: 15%;
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
  @property({type: Array}) data = [];

  @property({type: Object}) structs = {};

  @property({type: Object}) enums = {} as {[key: string]: unknown};

  @property({type: String, reflect: true}) version = '';

  @property({type: Boolean}) isEnum = false;

  @property({type: String}) parentAddress = '';

  @property({type: Function}) sortFn?: ((a: any, b: any) => number)|undefined;

  @property({type: Boolean}) sortAscending = true;

  @property({type: String}) sortedHeading = 'Address';

  private getVersionedData(version: string) {
    return this.data.filter(
        (item: {[key: string]: unknown}) =>
            version in (item.addr as {[key: string]: string}));
  }

  private getClasses() {
    if (this.isEnum) {
      return ['addr', 'desc']
    }
    return ['addr', 'size', 'desc'];
  }

  highlight(result: {row: number[], key: string}|void, shouldScroll = true) {
    if (!result) {
      return;
    }
    let rowElement = this.shadowRoot?.querySelectorAll('k-row')[result.row[0]]!;
    if (result.row.length == 1) {
      rowElement.highlightCell(result.key, shouldScroll);
    } else {
      rowElement.highlightSubTable(
          {row: result.row.slice(1), key: result.key}, shouldScroll)
    }
  }

  clearHighlights() {
    let rows = Array.from(this.shadowRoot?.querySelectorAll('k-row')!);
    rows.forEach(row => row.clearHighlights());
  }

  collapseAll() {
    let rows = Array.from(this.shadowRoot?.querySelectorAll('k-row')!);
    rows.forEach(row => row.collapseAll());
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

  private getData(sortFn: ((a: any, b: any) => number)|undefined) {
    const data = this.version ? this.getVersionedData(this.version) : this.data;
    if (sortFn) {
      let sortedData = data.slice();
      sortedData.sort(sortFn);
      return sortedData;
    } else {
      return data;
    }
  }

  private maybeSort(e: Event) {
    const columnHeadings = ['Address', 'Value', 'Offset', 'Description'];
    const columnKeys = ['addr', 'val', 'offset', 'desc'];
    const labelEl =
        (e.target as HTMLElement).parentElement?.querySelector('.label')! as
        HTMLElement;
    const sortEl =
        (e.target as HTMLElement).parentElement?.querySelector('.sort')! as
        HTMLElement;
    // Are we sorting by increasing or decreasing?
    if (sortEl.textContent?.trim()) {
      // Previously sorted, flip direction.
      this.sortAscending = !this.sortAscending;
    }
    if (columnHeadings.includes(labelEl.innerText.trim())) {
      this.sortedHeading = labelEl.innerText.trim();
      let keyIndex = columnHeadings.indexOf(labelEl.innerText.trim());
      let key = columnKeys[keyIndex];
      this.sortFn =
          (a: {[key: string]: unknown}, b: {[key: string]: unknown}) => {
            if (key == 'addr') {
              if (parseInt((a[key] as {[key: string]: string})[this.version]) <
                  parseInt((b[key] as {[key: string]:
                                           string})[this.version as string])) {
                return this.sortAscending ? -1 : 1;
              } else if (
                  parseInt((a[key] as {[key: string]: string})[this.version]) >
                  parseInt((b[key] as {[key: string]: string})[this.version])) {
                return this.sortAscending ? 1 : -1;
              } else {
                return 0;
              }
            } else {
              if ((a[key] as string) < (b[key] as string)) {
                return this.sortAscending ? -1 : 1;
              } else if ((a[key] as string) > (b[key] as string)) {
                return this.sortAscending ? 1 : -1;
              } else {
                return 0;
              }
            }
          }
    } else {
      this.sortedHeading = '';
      this.sortFn = undefined;
    }
  }

  render() {
    return html`
      <div id="table">
        <div>
          ${
        this.getHeadings().map(
            (heading, index) => html`
              <span class="heading ${this.getClasses()[index]}"
                    @click="${this.maybeSort}">
                <span class="label">
                  ${heading}
                </span>
                <span class="sort">
                  ${
                (this.sortedHeading == heading) ? html`▾` : html`&nbsp;&nbsp;`}
                </span>
              </span>`)}
        </div>
        <div>
          ${
        this.getData(this.sortFn)
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
            })}
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
