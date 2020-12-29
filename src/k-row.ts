import {css, customElement, html, LitElement, property} from 'lit-element';

/**
 * Renders a single row in a table.
 */
@customElement('k-row')
export class KRow extends LitElement {
  static styles = css`
    :host {
      background: var(--k-gray);
      border: 1px solid var(--k-black);
      display: flex;

      --k-blue: #2196F3;
      --k-gray: #F5F5F5;
      --k-black: #999999;
    }

    :host([odd]) {
      background: white;
    }

    div:not(:last-child) {
      border-right: 1px solid var(--k-black);
    }

    div {
      box-sizing: border-box;
      display: inline-block;
      overflow: hidden;
      padding: 3px;
      text-overflow: ellipsis;
    }

    div,
    span {
      transition: background-color .5s linear;
    }

    .size {
      flex: none;
      text-align: right;
      width: 5em;
    }

    .addr {
      flex: none;
      font-family: "Courier New", monospace;
      width: 7em;
    }

    .addr,
    .offset {
      text-align: right;
    }

    .val,
    .offset {
      width: 4em;
    }

    .has-tooltip {
      border-bottom: 1px dotted black;
      cursor: help;
    }

    .expand {
      color: var(--k-blue);
      cursor: pointer;
      text-decoration: underline;
    }

    .highlight {
      background-color: lightblue;
    }

    .desc,
    .params,
    .return {
      flex: 1;
    }

    .param {
      margin: 0;
    }
  `;

  /**
   * The JSON data to render.
   */
  @property({type: Object}) data = {} as {[key: string]: unknown};

  @property({type: Object}) structs = {} as {[key: string]: unknown};

  @property({type: Object}) enums = {} as {[key: string]: unknown};

  @property({type: String}) version = '';

  @property({type: Boolean, reflect: true}) odd = false;

  @property({type: Boolean, reflect: true}) expanded = false;

  @property({type: Boolean}) isEnum = false;

  @property({type: String}) parentAddress = '';

  @property({type: String}) maptype = '';

  private toHex(num: number): string {
    return num.toString(16).toUpperCase();
  }

  private getLength() {
    const size = this.getSize();
    const count = this.getCount();
    const length = size * count;
    return length;
  }

  async highlightCell(key: string, shouldScroll: boolean) {
    if (key == 'enum') {
      this.expanded = true;
    }
    await this.requestUpdate();
    let element = this.shadowRoot?.querySelector('.' + key)! as HTMLElement;
    if (shouldScroll) {
      // Account for the sticky header.
      const yOffset = -155;
      const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
    element.classList.add('highlight');
  }

  async highlightSubTable(
      result: {row: number[], key: string}, shouldScroll: boolean) {
    this.expanded = true;
    await this.requestUpdate();
    let table = this.shadowRoot?.querySelector('k-table')!;
    table.highlight(result, shouldScroll);
  }

  clearHighlights() {
    let highlights =
        Array.from(this.shadowRoot?.querySelectorAll('.highlight')!);
    highlights.forEach(el => el.classList.remove('highlight'));
    if (this.expanded) {
      let table = this.shadowRoot?.querySelector('k-table')!;
      table.clearHighlights();
    }
  }

  collapseAll() {
    if (this.expanded) {
      let table = this.shadowRoot?.querySelector('k-table')!;
      table.collapseAll();
    }
    this.expanded = false;
  }

  private getCount() {
    return 'count' in this.data ? parseInt(this.data.count as string, 16) : 1;
  }

  private getSize() {
    let size;
    if (this.data.size) {
      if (typeof size == 'object') {
        size = size[this.version];
      }
      size = parseInt(this.data.size as string, 16);
    } else {
      let type = (this.data.type as string).split('.')[0];
      switch (type) {
        case 'u8':
        case 's8':
        case 'flags8':
          size = 1;
          break;
        case 'u16':
        case 's16':
        case 'flags16':
          size = 2;
          break;
        case 'u32':
        case 's32':
        case 'ptr':
          size = 4;
          break;
        case 'palette':
          size = 32;
          break;
        default:
          size = parseInt((this.structs[type] as {size: string}).size, 16);
          break;
      }
    }
    return size;
  }

  private getTooltip() {
    if (['code', 'sprite_ai'].includes(this.maptype)) {
      return `Ends at ${
          this.toHex(parseInt(this.getAddress(), 16) + this.getLength() - 1)}`
    }
    if (this.version) {
      const count = this.getCount();
      if (count > 1) {
        const size = this.getSize();
        return 'Size: ' + this.toHex(size) + '\nCount: ' + this.toHex(count);
      }
      return '';
    } else {
      return 'Address: ' + this.getOffsetAddress();
    }
  }

  private getOffsetAddress() {
    let off = parseInt(this.data.offset as string, 16);
    return this.toHex(parseInt(this.parentAddress, 16) + off);
  }

  private showToggle() {
    return (this.isExpandEnum() || this.data.type as string in this.structs);
  }

  private expand() {
    this.expanded = !this.expanded;
  }

  private isExpandEnum() {
    return 'enum' in this.data;
  }

  private getExpandName(): string {
    return this.isExpandEnum() ? this.data.enum as string :
                                 this.data.type as string;
  }

  private getData() {
    if (this.isExpandEnum()) {
      return this.enums[this.getExpandName()];
    }
    return (this.structs[this.getExpandName()] as {[key: string]: unknown})
        .vars;
  }

  private getAddress(): string {
    if (this.version) {
      return (this.data.addr as {[key: string]: string})[this.version]
    }
    return this.data.offset as string;
  }

  private shouldAddrHaveToolTip() {
    return !this.version;
  }

  private getFirstClass(data: {[key: string]: unknown}) {
    if (data.val) {
      return 'val'
    } else if (data.addr) {
      return 'addr';
    }
    return 'offset';
  }

  render() {
    return this.isEnum ?
        html`
      <div class="${this.getFirstClass(this.data)}">${this.data.val}</div>
      <div class="desc">${this.data.desc}</div>` :
        html`
      <div class="${this.getFirstClass(this.data)}">
        <span class="${this.shouldAddrHaveToolTip() ? 'has-tooltip' : ''}"
              title="${
            this.shouldAddrHaveToolTip() ? this.getTooltip() :
                                           ''}">${this.getAddress()}</span>
      </div>
      <div class="size">
        <span class="${
            this.version && !!this.getTooltip() ? 'has-tooltip' : ''}"
              title="${this.getTooltip()}">${
            this.toHex(this.getLength())}</span>
      </div>
      <div class="desc">${this.data.desc} ${
            this.showToggle() ?
                html`<span class="expand" @click="${this.expand}">[${
                    this.expanded ? '-' : '+'}]</span>` :
                ''}
          ${
            this.expanded ? html`<k-table
              .data="${this.getData()}"
              ?isEnum="${this.isExpandEnum()}"
              .structs="${this.structs}"
              .enums="${this.enums}"
              .parentAddress="${
                                this.version ? this.getAddress() :
                                               this.getOffsetAddress()}">
            </k-table>` :
                            ''}
      </div>
      ${
                ['code', 'sprite_ai'].includes(this.maptype) ?
                html`
      <div class="params">
        <span>
          ${
                    this.data.params ?
                        (this.data.params as string[])
                            .map(
                                (param, index) => html`<p class="param">r${
                                    index}: ${param}</p>`) :
                        'void'}
        </span>
      </div>
      <div class="return">
        <span>
          ${this.data.return || 'void'}
        </span>
      </div>` :
                ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-row': KRow;
  }
}
