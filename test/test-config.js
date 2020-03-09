const config = require('../src/commands/config')
describe("Cli Config Test", () => {
    it("Config ok", () => {
      config('cli-test')
    });
});