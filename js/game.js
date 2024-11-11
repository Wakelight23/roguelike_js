import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { displayLobby, handleUserInput } from './server.js';

class Player {
  constructor() {
    this.maxHp = 100;
    this.currentHp = 100;
    this.minAttackDmg = 8;
    this.maxAttackDmg = 12;
    this.def = 0;
    this.dog = 0;
  }

  attack(monster) {
    const damage =
      Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) + this.minAttackDmg;
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return damage;
  }
}

class Monster {
  constructor(stage) {
    this.maxHp = 50 + stage * 10;
    this.currentHp = this.maxHp;
    this.attackDmg = 5 + stage * 2;
    this.def = 0;
  }

  attack(player) {
    const damage = this.attackDmg;
    player.currentHp = Math.max(0, player.currentHp - damage);
    return damage;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n====== Monster Status ======`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} |\n`) +
      chalk.redBright(
        `| 몬스터 정보 |\nHP:${monster.maxHp}/${monster.currentHp} 공격력:${monster.attackDmg} 방어력:${monster.def}`,
      ),
  );
  console.log(chalk.magentaBright(`===========================\n`));
  console.log(chalk.magentaBright(`\n====== Player Status ======`));
  console.log(
    chalk.blueBright(
      `| 플레이어 정보 |\nHP:${player.maxHp}/${player.currentHp} 공격력:${player.minAttackDmg}~${player.maxAttackDmg} 방어력:${player.def}`,
    ),
  );
  console.log(chalk.magentaBright(`===========================\n`));
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.currentHp > 0 && monster.currentHp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 선택지 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`),
    );
    console.log(
      chalk.green(
        `1.일반공격 | 2.특수공격(dmg+poker score) | 3.아이템 사용 | 4.도망가기 | 100.포기하기(게임종료)`,
      ),
    );
    console.log(
      chalk.green(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`),
    );

    // 플레이어의 선택에 따라 다음 행동 처리
    // 타임 스탬프를 찍어서 어떤 것을 최근의 선택했는지 알 수 있도록
    const choice = readlineSync.question('당신의 선택은? ');
    const timestamp = formatTime(new Date());
    logs.push(`[${timestamp}] ${chalk.green(`${choice}를 선택하셨습니다.`)}`);

    switch (choice) {
      // 1. 일반 공격
      case '1':
        // 일반 공격
        const playerDamage = player.attack(monster);
        logs.push(
          `[${timestamp}] ${chalk.yellow(`플레이어가 몬스터에게 ${playerDamage}의 데미지를 입혔습니다.`)}`,
        );
        if (monster.currentHp === 0) {
          logs.push(`[${timestamp}] ${chalk.green('몬스터를 물리쳤습니다!')}`);
          return true; // 전투 승리
        }
        break;
      // 2.특수공격
      case '2':
        break;
      // 아이템 사용
      case '3':
        console.log('미구현');
        break;
      case '4':
        break;
      case '100':
        console.log('시작 화면으로 돌아갑니다... 정말로요...?\n');
        const choice2 = readlineSync.question('Y or N : ');
        if (choice2 === 'Y' || choice2 === 'y') {
          console.log('엔터를 누르면 시작 화면으로 돌아갑니다... (소곤)다시 할거죠...?');
          readlineSync.question('');
          displayLobby();
          handleUserInput();
        } else if (choice2 === 'N' || choice2 === 'n') {
          console.log('배틀 화면으로 돌아갑니다...');
          battle();
        } else {
          console.log('Y, N 로만 입력해주세요');
          readlineSync.question('');
        }
        break;
      default:
        console.log('1~4, 100 중에서 입력해주세요');
        break;
    }
    if (monster.currentHp > 0 && choice != '100') {
      const monsterDamage = monster.attack(player);
      logs.push(
        `[${timestamp}] ${chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 데미지를 입혔습니다.`)}`,
      );
      if (player.currentHp === 0) {
        logs.push(`[${timestamp}] ${chalk.red('플레이어가 쓰러졌습니다. 게임 오버!')}`);
        return false; // 전투 패배
      }
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;
  while (stage <= 10) {
    const monster = new Monster(stage);
    const battleResult = await battle(stage, player, monster);
    if (!battleResult) {
      console.log(chalk.red('게임 오버! 메인 메뉴로 돌아갑니다.'));
      break;
    }
    console.log(chalk.green(`스테이지 ${stage} 클리어!`));
    stage++;
  }

  console.log('\n게임이 종료되었습니다. 엔터를 누르면 로비로 돌아갑니다...');
  readlineSync.question('');
  displayLobby();
  handleUserInput();
}
