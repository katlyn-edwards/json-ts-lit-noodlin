import {css, customElement, html, LitElement, property} from 'lit-element';

/**
 * Renders a table.
 */
@customElement('k-table')
export class KTable extends LitElement {
  static styles = css`
    :host {
      display: block;

      --k-black: #999999;
    }

    .heading {
      box-sizing: border-box;
      cursor: pointer;
      display: inline-block;
      font-weight: 700;
      overflow: hidden;
      padding: 3px;
      text-overflow: ellipsis;
      vertical-align: top;
    }

    .size {
      text-align: right;
      width: 5em;
    }

    .val,
    .offset {
      width: 4em;
    }

    .addr {
      width: 7em;
    }

    #table {
      margin: auto;
      max-width: 700px;
    }

    :host(#first) #heading-row {
      background: white;
      border-bottom: 1px solid var(--k-black);
      display: flex;
      position: sticky;
      top: 128px;
    }

    .desc,
    .params,
    .return {
      flex: 1;
    }

    .sort {
      display: inline-block;
    }

    :host(:not([sortascending])) .sort {
      transform: rotate(180deg);
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

  @property({type: Boolean, reflect: true}) sortAscending = true;

  @property({type: String}) sortedHeading = 'Address';

  @property({type: String}) maptype = '';

  private getVersionedData(version: string) {
    return this.data.filter(
        (item: {[key: string]: unknown}) =>
            version in (item.addr as {[key: string]: string}));
  }

  private getClasses() {
    if (this.version) {
      let classes = ['addr', 'size', 'desc'];
      if (['code', 'sprite_ai'].includes(this.maptype)) {
        classes.push('params', 'return');
      }
      return classes;
    }
    if (this.isEnum) {
      return ['val', 'desc']
    }
    return ['offset', 'size', 'desc'];
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

  private getHeadings(mapType: string) {
    if (this.version) {
      let headings = ['Address', 'Length', 'Description'];
      if (['code', 'sprite_ai'].includes(mapType)) {
        headings.push('Arguments', 'Returns');
      }
      return headings;
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
              if (parseInt(
                      (a[key] as {[key: string]: string})[this.version], 16) <
                  parseInt(
                      (b[key] as
                       {[key: string]: string})[this.version as string],
                      16)) {
                return this.sortAscending ? -1 : 1;
              } else if (
                  parseInt(
                      (a[key] as {[key: string]: string})[this.version], 16) >
                  parseInt(
                      (b[key] as {[key: string]: string})[this.version], 16)) {
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
        <div id="heading-row">
          ${
        this.getHeadings(this.maptype)
            .map(
                (heading, index) => html`
              <span class="heading ${this.getClasses()[index]}"
                    @click="${this.maybeSort}">
                <span class="label">
                  ${heading}
                </span>
                <span class="sort">
                  ${
                    (this.sortedHeading == heading) ? html`&#x25BE;` :
                                                      html`&nbsp;&nbsp;`}
                </span>
              </span>`)}
        </div>
        <div>
          ${
        this.getData(this.sortFn)
            .map((item: {[key: string]: unknown}, index: number) => {
              return html`<k-row
                  .maptype="${this.maptype}"
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
