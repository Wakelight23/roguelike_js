import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayLobby, handleUserInput } from './server.js';
import { playPoker } from './poker.js';
import { displayPokerRankings } from './poker_rankings.js';

class Player {
  constructor() {
    this.level = 1;
    this.exp = 0;
    this.maxHp = 100;
    this.currentHp = 100;
    this.minAttackDmg = 8;
    this.maxAttackDmg = 12;
    this.pokerScore = 0; // 포커 점수
    this.def = 1; // 방어력
    this.dog = 1; // 회피율
  }

  attack(monster) {
    const damage =
      Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) +
      this.minAttackDmg -
      monster.def;
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return damage;
  }

  sAttack(monster) {
    const damage =
      Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) +
      this.minAttackDmg +
      this.pokerScore -
      monster.def;
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return damage;
  }

  levelUp() {
    this.level++;
    this.minAttackDmg += 5;
    this.maxAttackDmg += 5;
    this.maxHp += 20;
    this.def += 2;
    this.currentHp = this.maxHp; // 레벨업 시 체력 회복
    console.log(chalk.green(`레벨 업! 현재 레벨: ${this.level}`));
    console.log(
      chalk.green(
        `공격력: ${this.minAttackDmg}~${this.maxAttackDmg}, 최대 체력: ${this.maxHp}, 방어력: ${this.def}`,
      ),
    );
  }

  gainExp() {
    this.exp++;
    if (this.exp >= 2) {
      this.levelUp();
      this.exp = 0;
    }
  }
}

class Monster {
  constructor(stage) {
    this.maxHp = 50 + stage * 10;
    this.currentHp = this.maxHp;
    this.minAttackDmg = 2 + stage * 2;
    this.maxAttackDmg = 6 + stage * 2;
    this.def = 0 + stage;
  }

  attack(player) {
    const damage =
      Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) +
      this.minAttackDmg -
      player.def;
    player.currentHp = Math.max(0, player.currentHp - damage);
    return damage;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n====== Monster Status ======`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} |\n`) +
      chalk.redBright(
        `| 몬스터 정보 |\nHP:${monster.maxHp}/${monster.currentHp} 공격력:${monster.minAttackDmg}~${monster.maxAttackDmg} 방어력:${monster.def}`,
      ),
  );
  console.log(chalk.magentaBright(`===========================\n`));
  console.log(chalk.magentaBright(`\n====== Player Status ======`));
  console.log(
    chalk.whiteBright(`
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠯⡯⢧⠀⡠⢋⡀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⢀⡰⡀⠀⠀⠠⠐⣁⣉⢸⣬⠁⠀⠉⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠈⠝⢛⣦⣀⣄⣞⣿⣳⣟⢿⣷⢤⡀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣷⣳⣷⣳⡽⣫⣯⡿⠇⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡨⣴⢟⣷⢿⣽⣷⡁⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠔⠙⢽⡽⣯⢾⣽⣾⣷⡃⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠑⢠⣷⡿⡽⡽⣾⢯⣿⠇⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⣴⠏⢉⣯⣿⠝⢽⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠘⠁⠀⣯⣷⠅⠀⢘⣗⠀⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠈⠙⠷⠀⠀⠀⠀⠀⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⡯⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    `),
  );
  console.log(
    chalk.blueBright(
      `         | 플레이어 정보 |\nLv:${player.level} HP:${player.maxHp}/${player.currentHp} 공격력:${player.minAttackDmg}~${player.maxAttackDmg} 특수공격:${player.minAttackDmg + player.pokerScore}~${player.maxAttackDmg + player.pokerScore} 방어력:${player.def}`,
    ),
  );
  console.log(chalk.magentaBright(`===========================\n`));
}

// 타임 스탬프 형태
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// HP 비율이 낮을수록 도망가기 성공 확률 증가
function calculateEscapeChance(monster) {
  const hpRatio = monster.currentHp / monster.maxHp;
  return 1 - hpRatio * 0.8; // 최소 20% ~ 최대 100% 확률
}

// 게임을 시작하고 배틀이 시작됐을 때
const battle = async (stage, player, monster) => {
  let logs = []; // 배틀하고 있을 때 저장할 배열
  let fullLogs = []; // 전체 로그를 저장할 배열

  while (player.currentHp > 0 && monster.currentHp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    const line = chalk.magentaBright('━'.repeat(50));
    const line2 = chalk.magentaBright('━'.repeat(20));
    console.log(line2 + ' Game Log ' + line2);
    logs.slice(-6).forEach((log) => console.log(log));
    console.log(line);

    console.log(
      chalk.green(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 선택지 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`),
    );
    console.log(
      chalk.green(
        `1.일반공격 | 2.특수공격(dmg+poker score) | 3.방어 | 4.도망가기 |\n100.족보확인 | 998.게임로그 | 999.포기하기(게임종료)`,
      ),
    );
    console.log(
      chalk.green(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`),
    );

    // 플레이어의 선택에 따라 다음 행동 처리
    // 타임 스탬프를 찍어서 어떤 것을 최근의 선택했는지 알 수 있도록
    const choice = readlineSync.question('당신의 선택은? ');
    const timestamp = formatTime(new Date());
    const newLog = `[${timestamp}] ${chalk.green(`${choice}를 선택하셨습니다.`)}`;
    logs.push(newLog);
    fullLogs.push(newLog);

    switch (choice) {
      // 1. 일반 공격
      case '1':
        const playerDamage = player.attack(monster);
        const playerAttackLog = `[${timestamp}] ${chalk.yellow(`플레이어가 몬스터에게 ${playerDamage}의 데미지를 입혔습니다.`)}`;
        logs.push(playerAttackLog);
        fullLogs.push(playerAttackLog);
        if (monster.currentHp === 0) {
          const winLog = `[${timestamp}] ${chalk.green('몬스터를 물리쳤습니다!')}`;
          logs.push(winLog);
          fullLogs.push(winLog);
          return true; // 전투 승리
        }
        break;
      // 2.특수공격
      case '2':
        const playerSDmg = player.sAttack(monster);
        const playerSAttLog = `[${timestamp}] ${chalk.yellow(`플레이어가 몬스터에게 특수 공격으로 ${playerSDmg}의 데미지를 입혔습니다. (포커 점수: ${player.pokerScore})`)}`;
        logs.push(playerSAttLog);
        fullLogs.push(playerSAttLog);
        if (monster.currentHp === 0) {
          logs.push(`[${timestamp}] ${chalk.green('몬스터를 물리쳤습니다!')}`);
          return true; // 전투 승리
        }
        break;
      // 방어하기
      case '3':
        // 방어하기
        const originalDef = player.def;
        player.def *= 4;
        const defLog = `[${timestamp}] ${chalk.blue(`몬스터의 공격에 대비합니다`)}`;
        logs.push(defLog);
        fullLogs.push(defLog);
        // 몬스터의 공격
        const monsterDamage = monster.attack(player);
        const monsterDmgLog = `[${timestamp}] ${chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 데미지를 입혔습니다.`)}`;
        logs.push(monsterDmgLog);
        fullLogs.push(monsterDmgLog);
        // 방어가 끝나면 다시 원래 방어력으로
        player.def = originalDef;
        // 방어를 했음에도 플레이어가 쓰러진다면
        if (player.currentHp === 0) {
          const gameOverLog = `[${timestamp}] ${chalk.red('플레이어가 쓰러졌습니다. 게임 오버!')}`;
          logs.push(gameOverLog);
          fullLogs.push(gameOverLog);
          return false; // 전투 패배
        }
        break;
      case '4':
        // 도망가기
        const escapeChance = calculateEscapeChance(monster);
        const escapeRoll = Math.random();
        const escapeLog = `[${timestamp}] ${chalk.yellow('플레이어가 도망가기를 시도합니다.')}`;
        logs.push(escapeLog);
        fullLogs.push(escapeLog);

        if (escapeRoll < escapeChance) {
          // 도망 성공
          const successLog = `[${timestamp}] ${chalk.green('도망가기 성공! 전투에서 벗어났습니다.')}`;
          logs.push(successLog);
          fullLogs.push(successLog);
          return 'escape'; // 도망 성공을 나타내는 특별한 값 반환
        } else {
          // 도망 실패
          const failLog = `[${timestamp}] ${chalk.red('도망가기 실패! 전투를 계속합니다.')}`;
          logs.push(failLog);
          fullLogs.push(failLog);
        }
        break;
      case '100':
        // 족보 확인
        displayPokerRankings();
        readlineSync.question(''); // 엔터 입력 대기
        break;
      case '998':
        // 998.게임로그
        console.clear();
        console.log(line2 + ' 전체 게임 로그 ' + line2);
        fullLogs.forEach((log) => console.log(log));
        console.log(line);
        console.log(chalk.green('엔터를 누르면 현재 스테이지로 돌아갑니다.'));
        readlineSync.question('');
        break;
        break;
      case '999':
        // 999. 게임종료(게임포기)
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
        console.log('잘못된 입력입니다. 선택지에 있는 번호만 입력해주세요');
        break;
    }
    if (
      monster.currentHp > 0 &&
      choice != '3' &&
      choice != '998' &&
      choice != '999' &&
      choice != '100'
    ) {
      const monsterDamage = monster.attack(player);
      const monsterAttackLog = `[${timestamp}] ${chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 데미지를 입혔습니다.`)}`;
      logs.push(monsterAttackLog);
      fullLogs.push(monsterAttackLog);
      if (player.currentHp === 0) {
        const gameOverLog = `[${timestamp}] ${chalk.red('플레이어가 쓰러졌습니다. 게임 오버!')}`;
        logs.push(gameOverLog);
        fullLogs.push(gameOverLog);
        return false; // 전투 패배
      }
    }
  }
};

// 플레이어의 스탯 정보
function displayPlayerStatus(player) {
  console.log(
    chalk.blueBright(
      `| 플레이어 정보 | Level: ${player.level}\n` +
        `HP: ${player.maxHp}/${player.currentHp}\n` +
        `공격력: ${player.minAttackDmg}~${player.maxAttackDmg}\n` +
        `특수공격: ${player.minAttackDmg + player.pokerScore}~${player.maxAttackDmg + player.pokerScore}\n` +
        `방어력: ${player.def}\n` +
        `포커 점수: ${player.pokerScore}`,
    ),
  );
  const line = chalk.magentaBright('#'.repeat(55));
  console.log(line);
}

export async function startGame() {
  console.clear();
  const player = new Player();

  console.log(chalk.yellow('게임을 시작하기 전에 포커 게임을 진행합니다...'));
  const initialPokerResult = playPoker();
  player.pokerScore += initialPokerResult.score;
  console.log(chalk.yellow(`초기 포커 점수: ${player.pokerScore}`));

  let stage = 1;
  while (stage <= 10) {
    const monster = new Monster(stage);
    // Status 표시
    const line = chalk.magentaBright('#'.repeat(20));
    console.log(line + ' Player Status ' + line);
    displayPlayerStatus(player);
    readlineSync.question('');
    // Status 표시 후 battle 시작
    const battleResult = await battle(stage, player, monster);
    // battle()에서 나온 결과물에 따라서
    if (battleResult === false) {
      console.log(chalk.red('게임 오버! 메인 메뉴로 돌아갑니다.'));
      break;
    } else if (battleResult === 'escape') {
      console.log(chalk.yellow('도망에 성공했습니다. 다음 스테이지로 넘어갑니다.'));
      stage++;
      continue; // 포커 게임을 건너뛰고 다음 스테이지로
    }

    // 스테이지를 클리어 했을 때
    console.log(chalk.green(`스테이지 ${stage} 클리어!`));
    player.gainExp(); // 경험치 기록

    console.log(chalk.yellow('포커 게임을 시작합니다... (Press Enter)'));
    readlineSync.question('');

    // 스테이지 클리어 후 포커 게임 시작
    const pokerResult = playPoker();
    player.pokerScore += pokerResult.score;
    console.log(chalk.yellow(`현재 누적 포커 점수: ${player.pokerScore}`));

    stage++;
  }

  console.log('\n게임이 종료되었습니다. 엔터를 누르면 로비로 돌아갑니다...');
  readlineSync.question('');
  displayLobby();
  handleUserInput();
}
