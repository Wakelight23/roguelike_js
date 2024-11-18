import chalk from 'chalk';
import readlineSync from 'readline-sync';

const abilities = [
  {
    name: '공격력2배',
    description: '기본 공격력이 2배 증가합니다 ',
    apply: (player) => {
      player.increasex2 = true;
    },
    rarity: '에픽',
    chance: 0.05,
  },
  {
    name: '공격력4배',
    description: '기본 공격력이 4배 증가합니다 ',
    apply: (player) => {
      player.increasex4 = true;
    },
    rarity: '레전더리',
    chance: 0.01,
  },
  {
    name: '자연회복',
    description: '1턴마다 최대체력의 10%를 회복합니다.',
    apply: (player) => {
      player.naturalHealing = true;
    },
    rarity: '레전더리',
    chance: 0.01,
  },
  {
    name: '아이언스킨',
    description: '몬스터에게 받는 피해가 10% 줄어듭니다.',
    apply: (player) => {
      player.ironSkin = true;
    },
    rarity: '레어',
    chance: 0.1,
  },
  {
    name: '급소공격',
    description: '일반 공격 시 1% 확률로 몬스터가 즉사합니다.',
    apply: (player) => {
      player.criticalHit = true;
    },
    rarity: '레전더리',
    chance: 0.01,
  },
  {
    name: '빠른발',
    description: '몬스터의 공격을 10%의 확률로 회피할 수 있습니다.',
    apply: (player) => {
      player.evasion = (player.evasion || 0) + 0.1;
    },
    rarity: '에픽',
    chance: 0.05,
  },
  {
    name: '공격력증가_소',
    description: '최소공격력과 최대공격력이 +10 증가합니다.',
    apply: (player) => {
      player.minAttackDmg += 10;
      player.maxAttackDmg += 10;
    },
    rarity: '언커먼',
    chance: 0.2,
  },
  {
    name: '공격력증가_중',
    description: '최소공격력과 최대공격력이 +25 증가합니다.',
    apply: (player) => {
      player.minAttackDmg += 25;
      player.maxAttackDmg += 25;
    },
    rarity: '레어',
    chance: 0.1,
  },
  {
    name: '공격력증가_대',
    description: '최소공격력과 최대공격력이 +50 증가합니다.',
    apply: (player) => {
      player.minAttackDmg += 50;
      player.maxAttackDmg += 50;
    },
    rarity: '에픽',
    chance: 0.05,
  },
  {
    name: '공격력증가_극대',
    description: '최소공격력과 최대공격력이 +50 증가합니다.',
    apply: (player) => {
      player.minAttackDmg += 100;
      player.maxAttackDmg += 100;
    },
    rarity: '레전더리',
    chance: 0.01,
  },
  {
    name: '돌진공격',
    description: '공격할 때마다 피해를 입는 대신 최소공격력, 최대공격력 +50% 증가합니다.',
    apply: (player) => {
      player.rushAttack = true;
      player.minAttackDmg = Math.floor(player.minAttackDmg * 1.5);
      player.maxAttackDmg = Math.floor(player.maxAttackDmg * 1.5);
    },
    rarity: '에픽',
    chance: 0.05,
  },
  {
    name: '건강하다',
    description: '최대체력 +100 증가합니다.',
    apply: (player) => {
      player.maxHp += 100;
      player.currentHp += 100;
    },
    rarity: '언커먼',
    chance: 0.2,
  },
  {
    name: '거~언강하다!',
    description: '최대체력 +200 증가합니다.',
    apply: (player) => {
      player.maxHp += 200;
      player.currentHp += 200;
    },
    rarity: '레어',
    chance: 0.1,
  },
  {
    name: '굳건하다!',
    description: '최대체력 +400 증가합니다.',
    apply: (player) => {
      player.maxHp += 400;
      player.currentHp += 400;
    },
    rarity: '에픽',
    chance: 0.05,
  },
  {
    name: '체력괴물',
    description: '최대체력 +1000 증가합니다.',
    apply: (player) => {
      player.maxHp += 1000;
      player.currentHp += 1000;
    },
    rarity: '레전더리',
    chance: 0.01,
  },
  {
    name: '일회용회복',
    description: '현재 체력의 30%를 즉시 회복합니다.',
    apply: (player) => {
      const healAmount = Math.floor(player.maxHp * 0.3);
      player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
    },
    rarity: '커먼',
    chance: 0.4,
    repeatable: true,
  },
  {
    name: '그럭저럭 건강하다',
    description: '최대체력 +50 증가합니다.',
    apply: (player) => {
      player.maxHp += 50;
      player.currentHp += 50;
    },
    rarity: '커먼',
    chance: 0.4,
    repeatable: true,
  },
  {
    name: '공격력증가_극소',
    description: '공격력이 +5 증가합니다',
    apply: (player) => {
      player.minAttackDmg += 5;
      player.maxAttackDmg += 5;
    },
    rarity: '커먼',
    chance: 0.4,
    repeatable: true,
  },
  {
    name: '방어력증가_극소',
    description: '방어력이 +2 증가합니다',
    apply: (player) => {
      player.def += 2;
    },
    rarity: '커먼',
    chance: 0.4,
    repeatable: true,
  },
  {
    name: '흡혈',
    description: '공격 시 입힌 데미지의 10%만큼 체력을 회복합니다.',
    apply: (player) => {
      player.vampiric = true;
    },
    rarity: '에픽',
    chance: 0.05,
  },

  {
    name: '연속공격',
    description: '20% 확률로 한 번 더 공격합니다.',
    apply: (player) => {
      player.doubleStrike = true;
    },
    rarity: '레어',
    chance: 0.1,
  },

  {
    name: '방어력관통',
    description: '몬스터의 방어력을 20 무시합니다.',
    apply: (player) => {
      player.penetration = 20;
    },
    rarity: '에픽',
    chance: 0.05,
  },

  {
    name: '광전사',
    description: '체력이 30% 이하일 때 공격력이 50% 증가합니다.',
    apply: (player) => {
      player.berserk = true;
    },
    rarity: '에픽',
    chance: 0.05,
  },

  {
    name: '카운터',
    description: '방어 시 받은 데미지의 50%를 반사합니다.',
    apply: (player) => {
      player.counterAttack = true;
    },
    rarity: '레어',
    chance: 0.1,
  },

  {
    name: '포커의달인',
    description: '포커 점수가 1.5배로 적용됩니다.',
    apply: (player) => {
      player.pokerMaster = true;
    },
    rarity: '레전더리',
    chance: 0.01,
  },

  {
    name: '강철의심장',
    description: '치명적인 공격을 1회 버티고 체력 1로 생존합니다.',
    apply: (player) => {
      player.surviveOnce = true;
    },
    rarity: '레전더리',
    chance: 0.01,
  },

  {
    name: '방어전문가',
    description: '방어 시 방어력이 5배로 증가합니다.',
    apply: (player) => {
      player.defenseExpert = true;
    },
    rarity: '에픽',
    chance: 0.05,
  },

  {
    name: '마지막일격',
    description: '체력이 20% 이하인 몬스터에게 더블 데미지를 입힙니다.',
    apply: (player) => {
      player.executeAbility = true;
    },
    rarity: '레어',
    chance: 0.1,
  },

  {
    name: '포커의축복',
    description: '포커 게임에서 카드 교환 기회가 1회 추가됩니다.',
    apply: (player) => {
      player.extraPokerExchange = true;
    },
    rarity: '언커먼',
    chance: 0.2,
  },
];

// 등급별 색 설정
export const rarityColors = {
  커먼: chalk.white,
  언커먼: chalk.green,
  레어: chalk.blue,
  에픽: chalk.magenta,
  레전더리: chalk.yellow,
};

// 능력치를 선택
export function chooseAbility(player) {
  console.clear();
  console.log(chalk.yellow('추가 능력치를 선택하세요'));

  // 능력치를 선택했을 때
  const selectedAbilities = player.abilities ? player.abilities.map((ability) => ability.name) : [];

  // 3가지의 랜덤 능력 선택
  let choices = getRandomAbilities(3, selectedAbilities);
  let rerollCount = 1;

  while (true) {
    displayChoices(choices);

    const choice = readlineSync.question('선택 (1-3) 또는 R(reroll): ');

    if (choice.toLowerCase() === 'r' && rerollCount > 0) {
      choices = getRandomAbilities(3, selectedAbilities);
      rerollCount--;
      console.log(chalk.yellow(`능력을 다시 선택합니다. 남은 reroll 기회=(${rerollCount})`));
      continue;
    }

    const selectedAbility = choices[parseInt(choice) - 1];
    if (selectedAbility) {
      selectedAbility.apply(player);
      console.log(chalk.green(`'${selectedAbility.name}' 능력을 획득했습니다!`));

      // '일회용회복'이 아닌 경우에만 abilities 배열에 추가
      if (selectedAbility.name !== '일회용회복') {
        player.abilities = player.abilities || [];
        player.abilities.push(selectedAbility);
        if (!selectedAbility.repeatable) {
          selectedAbilities.push(selectedAbility.name);
        }
      }

      displayPlayerStatus(player);
      break;
    } else {
      console.log(chalk.red('잘못된 선택입니다. 다시 선택해주세요.'));
    }
  }

  readlineSync.question('계속하려면 엔터를 누르세요...');
}

// 능력을 확률적으로 UI에 표시
function getRandomAbilities(count, selectedAbilities) {
  // 이미 선택되지 않은 능력들만 필터링
  const availableAbilities = abilities.filter(
    (ability) => ability.repeatable || !selectedAbilities.includes(ability.name),
  );

  const chosenAbilities = [];

  while (chosenAbilities.length < count && availableAbilities.length > 0) {
    // 전체 확률의 합 계산
    const totalChance = availableAbilities.reduce((sum, ability) => sum + ability.chance, 0);

    // 0부터 전체 확률까지의 랜덤 값 생성
    const roll = Math.random() * totalChance;

    // 누적 확률 계산하며 능력 선택
    let currentSum = 0;
    for (let i = 0; i < availableAbilities.length; i++) {
      currentSum += availableAbilities[i].chance;
      if (roll <= currentSum) {
        chosenAbilities.push(availableAbilities[i]);
        // 선택된 능력이 반복 불가능한 경우 제거
        if (!availableAbilities[i].repeatable) {
          availableAbilities.splice(i, 1);
        }
        break;
      }
    }
  }

  // 충분한 능력을 선택하지 못한 경우 남은 자리를 채움
  while (chosenAbilities.length < count && availableAbilities.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableAbilities.length);
    chosenAbilities.push(availableAbilities[randomIndex]);
    if (!availableAbilities[randomIndex].repeatable) {
      availableAbilities.splice(randomIndex, 1);
    }
  }

  return chosenAbilities;
}

// 선택지에서 어떻게 표시될지 = 선택 UI
function displayChoices(choices) {
  choices.forEach((ability, index) => {
    const colorFunction = rarityColors[ability.rarity] || chalk.white;
    console.log(colorFunction(`${index + 1}. ${ability.name}: ${ability.description}`));
  });
}

// Display에 변경점 표시
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
    console.log(chalk.yellowBright('보유 능력:'));
    player.abilities.forEach((ability) => {
      if (ability.name !== '일회용회복') {
        console.log(chalk.yellowBright(`- ${ability.name}`));
      }
    });
  } else {
    console.log(chalk.yellowBright('보유 능력: 없음'));
  }
  console.log(line);
}
