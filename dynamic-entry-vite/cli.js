
import inquirer from 'inquirer';
import { execSync } from 'child_process';

const projects = [
  'project-a',
  'project-b',
];

const command = process.argv[2];

if (!command) {
  inquirer
    .prompt([
      {
        type: 'rawlist',
        message: `选择要执行的命令`,
        name: 'command',
        choices: ['run dev', 'run build'],
      },
      {
        type: 'rawlist',
        message: `选择一个项目`,
        name: 'project',
        choices: projects,
      },
    ])
    .then((answers) => {
      execSync(`npm ${answers.command} --project=${answers.project}`, { stdio: 'inherit' });
    })
    .catch((error) => {
      console.log(error);
    });
} else {
  inquirer
    .prompt([
      {
        type: 'rawlist',
        message: `选择一个项目 run ${command}`,
        name: 'project',
        choices: projects,
      },
    ])
    .then((answers) => {
      execSync(`npm run ${command} --project=${answers.project}`, { stdio: 'inherit' });
    })
    .catch((error) => {
      console.log(error);
    });
}
