import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);

export default async function prompt(name, choices, message, type = 'list') {
  const questions = [];
  questions.push({
    type,
    name,
    message,
    choices,
  });

  const answers = await inquirer.prompt(questions);
  return type === 'checkbox' ? answers : answers[name];
}
