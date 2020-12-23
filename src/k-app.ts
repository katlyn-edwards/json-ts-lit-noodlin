import {LitElement, html, customElement, property, css} from 'lit-element';

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
  `;

  @property({type: String})
  version = 'U';

  @property({type: Object})
  enums: Object = {};

  @property({type: Object})
  structs: Object = {};

  @property({type: Array})
  ram: Object[] = [];

  constructor() {
    super();
    this.fetchData();
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

  render() {
    return html`
      <div>
        <h1>Metroid Fusion RAM Map</h1>
        <p id="version">
          Version:
          <select @change="${this.changeHandler}">
            ${this.getVersions()
              .map(version => html`<option value="${version}">${version}</option>`)}
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
    this.version = this.shadowRoot!.querySelector("select")!.value
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'k-app': KApp;
  }
}
