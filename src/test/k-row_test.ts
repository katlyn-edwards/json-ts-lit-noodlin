import {KRow} from '../k-row.js';
import {fixture, html} from '@open-wc/testing';

const assert = chai.assert;

suite('k-row', () => {
  test('is defined', () => {
    const el = document.createElement('k-row');
    assert.instanceOf(el, KRow);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<k-row></k-row>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('renders with a set name', async () => {
    const el = await fixture(html`<k-row name="Test"></k-row>`);
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
      <slot></slot>
    `
    );
  });

  test('handles a click', async () => {
    const el = (await fixture(html`<k-row></k-row>`)) as KRow;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
      <slot></slot>
    `
    );
  });
});
