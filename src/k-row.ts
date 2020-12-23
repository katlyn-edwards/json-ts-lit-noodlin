import {LitElement, html, customElement, property, css} from 'lit-element';

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

    .size {
      flex: none;
      text-align: right;
      width: 15%;
    }

    .addr {
      flex: none;
      font-family: "Courier New", monospace;
      text-align: right;
      width: 20%;
    }

    .desc {
      flex: 1;
    }

    .has-tooltip {
      border-bottom: 1px dotted black;
      cursor: help;
    }

    .expand {
      cursor: pointer;
      text-decoration: underline;
      color: var(--k-blue);
    }
  `;

  /**
   * The JSON data to render.
   */
  @property({type: Object})
  data = {} as {[key: string]: unknown};

  @property({type: Object})
  structs = {} as {[key: string]: unknown};

  @property({type: Object})
  enums = {} as {[key: string]: unknown};

  @property({type: String})
  version = '';

  @property({type: Boolean, reflect: true})
  odd = false;

  @property({type: Boolean, reflect: true})
  expanded = false;

  @property({type: Boolean})
  isEnum = false;

  @property({type: String})
  parentAddress = '';

  private toHex(num: number): string {
    return num.toString(16).toUpperCase();
  }

  private getLength() {
    const size = this.getSize();
    const count = this.getCount();
    const length = size * count;
    return this.toHex(length);
  }

  private getCount() {
    return "count" in this.data ? parseInt(this.data.count as string, 16) : 1;
  }

  private getSize() {
    let size;
    if (this.data.size) {
      size = parseInt(this.data.size as string, 16);
    } else {
      switch(this.data.type) {
        case "u8":
        case "s8":
        case "flags8":
          size = 1;
          break;
        case "u16":
        case "s16":
        case "flags16":
          size = 2;
          break;
        case "u32":
        case "s32":
        case "pointer":
          size = 4;
          break;
        default:
          size = parseInt((this.structs[this.data.type as string] as {size: string}).size, 16);
          break;
      }
    }
    return size;
  }

  private getTooltip() {
    if (this.version ) {
      const count = this.getCount();
      if (count > 1) {
        const size = this.getSize();
        return "Size: " + this.toHex(size) + "\nCount: " + this.toHex(count);
      }
      return '';
    } else {
      let off = parseInt(this.data.offset as string, 16);
      return "Address: " + this.toHex(parseInt(this.parentAddress, 16) + off);
    }
  }

  private showToggle() {
    return (this.isExpandEnum() || this.data.type as string in this.structs);
  }

  private expand() {
    this.expanded = !this.expanded;
  }

  private isExpandEnum() {
    return "enum" in this.data;
  }

  private getExpandName(): string {
    return this.isExpandEnum() ? this.data.enum as string: this.data.type as string;
  }

  private getData() {
    if (this.isExpandEnum()) {
      return this.enums[this.getExpandName()];
    }
    return (this.structs[this.getExpandName()] as {[key: string]: unknown}).vars;
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

  render() {
    return this.isEnum ?
    html`
      <div class="addr">${this.data.val}</div>
      <div class="desc">${this.data.desc}</div>` :
    html`
      <div class="addr">
        <span class="${this.shouldAddrHaveToolTip() ? 'has-tooltip' : ''}"
              title="${this.shouldAddrHaveToolTip() ? this.getTooltip() : ''}">${this.getAddress()}</span>
      </div>
      <div class="size">
        <span class="${this.version && !!this.getTooltip() ? 'has-tooltip' : ''}"
              title="${this.getTooltip()}">${this.getLength()}</span>
      </div>
      <div class="desc">${this.data.desc} ${this.showToggle() ?
          html`<span class="expand" @click="${this.expand}">[${this.expanded ? '-' : '+'}]</span>` :
          ''}
          ${this.expanded ? html`<k-table
              .data="${this.getData()}"
              ?isEnum="${this.isExpandEnum()}"
              .structs="${this.structs}"
              .enums="${this.enums}"
              .parentAddress="${this.version ? this.getAddress() : ''}">
            </k-table>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-row': KRow;
  }
}
