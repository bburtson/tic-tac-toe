import { TickTacToePage } from './app.po';

describe('tick-tac-toe App', () => {
  let page: TickTacToePage;

  beforeEach(() => {
    page = new TickTacToePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
