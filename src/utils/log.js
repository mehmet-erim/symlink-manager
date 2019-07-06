import ora from 'ora';
import kleur from 'kleur';
kleur.enabled = require('color-support').level;

export class Log {
  static log(text, color) {
    console.log(kleur[color]().bold(text));
  }

  static info(text) {
    this.log(text, 'cyan');
  }

  static primary(text) {
    this.log(text, 'blue');
  }

  static success(text) {
    this.log(text, 'green');
  }

  static error(text) {
    this.log(text, 'red');
  }

  static spinner(text) {
    const spinner = ora(kleur.cyan().bold(text));
    spinner.color = 'yellow';
  }
}
