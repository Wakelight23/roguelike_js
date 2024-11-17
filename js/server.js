import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame } from './game.js';
import { displayPokerRankings } from './poker_rankings.js';
import { playPoker } from './poker.js';
import {
  displayAchievements,
  loadAchievements,
  resetAchievements,
  saveAchievements,
  validateAchievementsFile,
} from './achievements.js';

// 로비 화면을 출력하는 함수
export function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.cyan(
      figlet.textSync('POKER\nROGUELIKE', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.magentaBright('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

  // 설명 텍스트
  console.log(chalk.redBright('!!!전체화면으로 플레이하는 것을 추천드립니다!!!'));
  console.log(chalk.green('옵션을 선택해주세요.'));
  console.log();

  // 옵션들
  console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
  console.log(chalk.blue('2.') + chalk.white(' 업적 확인하기'));
  console.log(
    chalk.blue('3.') + chalk.white(` 포커 족보 ${chalk.redBright('(포커를 처음한다면 확인!!)')}`),
  );
  console.log(chalk.blue('4.') + chalk.white(' 포커 연습'));
  console.log(chalk.blue('5.') + chalk.white(' 종료'));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('1-5 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
export async function handleUserInput() {
  const choice = readlineSync.question('입력 : ');

  switch (choice) {
    case '1':
      console.log(chalk.green('게임을 시작합니다.'));
      startGame();
      break;
    case '2':
      // 업적 확인하기 로직을 구현
      await displayAchievements();
      const achievementChoice = readlineSync.question('write "reset" : ');
      if (achievementChoice === 'reset') {
        console.log('업적이 초기화를 시작합니다. 엔터를 누르면 시작합니다...');
        resetAchievements();
      }
      displayLobby();
      handleUserInput();
      break;
    case '3':
      // 포커 족보
      displayPokerRankings();
      readlineSync.question('');
      displayLobby();
      handleUserInput();
      break;
    case '4':
      // 포커 연습
      playPoker();
      readlineSync.question('');
      displayLobby();
      handleUserInput();
      break;
    case '5':
      console.log(chalk.red('게임을 종료합니다.'));
      await saveAchievements(); // 게임 종료 전 업적 저장 (한 번만 호출)
      console.log('업적이 저장되었습니다. 엔터를 눌러 종료하세요.');
      readlineSync.question('');
      process.exit(0);
      break;
    default:
      console.log(chalk.red('올바른 선택을 하세요.'));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

// 게임 시작 함수
async function start() {
  console.log('업적을 불러옵니다.');
  await validateAchievementsFile();
  await loadAchievements();
  readlineSync.question('');
  displayLobby();
  await handleUserInput();
}

// 게임 실행
start();
