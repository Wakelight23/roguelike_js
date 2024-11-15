import chalk from 'chalk';
import readlineSync from 'readline-sync';

const abilities = [
  {
    name: '두번공격',
    description: '더블 슬래쉬 : 모든 공격을 두 번 사용합니다.',
    apply: (player) => {
      player.doubleAttack = true;
    },
  },
  {
    name: '자연회복',
    description: '자연회복 : 1턴마다 최대체력의 10%를 회복합니다.',
    apply: (player) => {
      player.naturalHealing = true;
    },
  },
  {
    name: '아이언스킨',
    description: '아이언 스킨 : 몬스터에게 받는 피해가 30% 줄어든다.',
    apply: (player) => {
      player.ironSkin = true;
    },
  },
  {
    name: '급소공격',
    description: '급소공격 : 5% 확률로 몬스터가 즉사한다',
    apply: (player) => {
      player.criticalHit = true;
    },
  },
  {
    name: '빠른발',
    description: '빠른발 : 회피율이 30% 증가한다',
    apply: (player) => {
      player.evasion = (player.evasion || 0) + 0.3;
    },
  },
  {
    name: '공격력증가_중',
    description: '공격력증가_중 : 최소공격력과 최대공격력이 +50',
    apply: (player) => {
      player.minAttackDmg += 50;
      player.maxAttackDmg += 50;
    },
  },
  {
    name: '크러셔',
    description: '크러셔 - 몬스터의 방어력을 50% 무시한다',
    apply: (player) => {
      player.crusher = true;
    },
  },
  {
    name: '공격력증가_소',
    description: '공격력증가_소 : 최소공격력과 최대공격력이 +25',
    apply: (player) => {
      player.minAttackDmg += 25;
      player.maxAttackDmg += 25;
    },
  },
  {
    name: '공격력증가_대',
    description: '공격력증가_대 : 최소공격력과 최대공격력이 +100',
    apply: (player) => {
      player.minAttackDmg += 100;
      player.maxAttackDmg += 100;
    },
  },
  {
    name: '돌진공격',
    description: '돌진공격 : 공격할 때마다 피해를 입는 대신 최소공격력, 최대공격력 +30%',
    apply: (player) => {
      player.rushAttack = true;
      player.minAttackDmg *= 1.3;
      player.maxAttackDmg *= 1.3;
    },
  },
  {
    name: '건강하다',
    description: '건강하다! : 최대체력 +200',
    apply: (player) => {
      player.maxHp += 200;
      player.currentHp += 200;
    },
  },
];

export function chooseAbility(player) {
  console.clear();
  console.log(chalk.yellow('추가 능력치를 선택하세요'));

  let choices = getRandomAbilities(3);
  let rerollCount = 1;

  while (true) {
    displayChoices(choices);

    const choice = readlineSync.question('선택 (1-3) 또는 R(reroll): ');

    if (choice.toLowerCase() === 'r' && rerollCount > 0) {
      choices = getRandomAbilities(3);
      rerollCount--;
      console.log(chalk.yellow(`능력을 다시 선택합니다. 남은 reroll 기회: ${rerollCount}`));
      continue;
    }

    const selectedAbility = choices[parseInt(choice) - 1];
    if (selectedAbility) {
      player.abilities = player.abilities || [];
      player.abilities.push(selectedAbility);
      selectedAbility.apply(player);
      console.log(chalk.green(`'${selectedAbility.name}' 능력을 획득했습니다!`));
      displayPlayerStatus(player);
      break;
    } else {
      console.log(chalk.red('잘못된 선택입니다. 다시 선택해주세요.'));
    }
  }

  readlineSync.question('계속하려면 엔터를 누르세요...');
}

function getRandomAbilities(count) {
  const shuffled = [...abilities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayChoices(choices) {
  choices.forEach((ability, index) => {
    console.log(`${index + 1}. ${ability.name}: ${ability.description}`);
  });
}

function displayPlayerStatus(player) {
  const line = chalk.green('━'.repeat(40));
  console.log(line);
  console.log(chalk.green(`| 플레이어 정보 | Lv: ${chalk.yellow(player.level)}`));
  console.log(chalk.green(`HP: ${chalk.yellow(player.maxHp)}/${chalk.yellow(player.currentHp)}`));
  console.log(
    chalk.green(
      `공격력: ${chalk.yellow(player.minAttackDmg)}~${chalk.yellow(player.maxAttackDmg)}`,
    ),
  );
  console.log(
    chalk.green(
      `특수공격: ${chalk.yellow(player.minAttackDmg + player.pokerScore)}~${chalk.yellow(player.maxAttackDmg + player.pokerScore)}`,
    ),
  );
  console.log(chalk.green(`방어력: ${chalk.yellow(player.def)}`));
  if (player.abilities && player.abilities.length > 0) {
    console.log(chalk.green('획득한 능력:'));
    player.abilities.forEach((ability) => {
      console.log(chalk.green(`- ${ability.name}`));
    });
  }
  console.log(line);
}
