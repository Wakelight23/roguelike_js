import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const ACHIEVEMENTS_FILE = path.join(process.cwd(), 'achievements.json');

// id, 업적 이름, 상세, 달성여부
const achievements = [
  {
    id: 'game_clear',
    name: '게임을 클리어 했다',
    description: 'stage를 1부터 10까지 전부 클리어',
    achieved: false,
  },
  {
    id: 'royal_straight_flush',
    name: '로오오오야야야르를 스토레이트으 풀라아쉬!!!????',
    description: '포커 게임에서 처음으로 로얄 스트레이트 플러시가 나온다',
    achieved: false,
  },
  {
    id: 'straight_flush',
    name: '스트...레이트... 근데 색깔이 다 똑같아!',
    description: '포커 게임에서 처음으로 스트레이트 플러시가 나온다',
    achieved: false,
  },
  {
    id: 'four_of_a_kind',
    name: '나야... 포 카드',
    description: '포커 게임에서 처음으로 포카드가 나온다',
    achieved: false,
  },
  {
    id: 'high_attack',
    name: '이게 가능했었어...?',
    description: 'Player maxAttackDmg 500 달성',
    achieved: false,
  },
  {
    id: 'first_game_over',
    name: '그럴 수 있어',
    description: '처음 게임오버 한다',
    achieved: false,
  },
  { id: 'even_hands', name: 'Even하네요', description: '투 페어 연속 5번', achieved: false },
  {
    id: 'bad_luck',
    name: '오늘은 날이 아니올씨다',
    description: '하이카드 연속 5번',
    achieved: false,
  },
];

let consecutiveTwoPairs = 0;
let consecutiveHighCards = 0;
let line50 = chalk.magentaBright('━'.repeat(50));
let line20 = chalk.magentaBright('━'.repeat(20));

// 업적 초기화
export function resetAchievements() {
  achievements.forEach((achievement) => {
    achievement.achieved = false;
  });
  saveAchievements();
  console.log(chalk.yellow('모든 업적이 초기화되었습니다.'));
}

// 형식 확인, json 파일 안에 형식이 알맞은 형태인지 체크
export async function validateAchievementsFile() {
  try {
    const data = await fs.readFile(ACHIEVEMENTS_FILE, 'utf8');
    JSON.parse(data); // 파일 내용이 유효한 JSON인지 확인
  } catch (error) {
    console.error('Invalid achievements file. Resetting achievements.');
    await saveAchievements(); // 파일을 올바른 형식으로 다시 저장
  }
}

// Json파일로 저장된 업적 파일 불러오기
export async function loadAchievements() {
  try {
    const data = await fs.readFile(ACHIEVEMENTS_FILE, 'utf8');
    const loadedAchievements = JSON.parse(data);
    achievements.forEach((achievement, index) => {
      if (loadedAchievements[index]) {
        achievement.achieved = loadedAchievements[index].achieved;
      }
    });
    console.log('Achievements loaded successfully');
  } catch (error) {
    console.error('Failed to load achievements:', error);
    if (error.code === 'ENOENT') {
      await saveAchievements();
    }
  }
}

// Json 형태로 업적 저장해서 후에 플레이할 때도 업적이 유지되도록
export async function saveAchievements() {
  try {
    const achievementsData = JSON.stringify(achievements, null, 2);
    await fs.writeFile(ACHIEVEMENTS_FILE, achievementsData);
    console.log('Achievements saved successfully');
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
}

// 업적을 달성했는지 확인
export function checkAchievement(id) {
  const achievement = achievements.find((a) => a.id === id);
  if (achievement && !achievement.achieved) {
    achievement.achieved = true;
    console.log(
      chalk.yellow(
        `${chalk.redBright('★★★')} 업적 달성: ${achievement.name} ${chalk.redBright('★★★')}`,
      ),
    );
    saveAchievements();
  }
}

// 포커에 대한 업적 달성 체크
// 포커를 플레이할 때마다 카운트
export function checkPokerHand(handRank) {
  if (handRank === '로얄 스트레이트 플러시') {
    checkAchievement('royal_straight_flush');
  } else if (handRank === '스트레이트 플러시') {
    checkAchievement('straight_flush');
  } else if (handRank === '포카드') {
    checkAchievement('four_of_a_kind');
  } else if (handRank === '투페어') {
    consecutiveTwoPairs++;
    consecutiveHighCards = 0;
    if (consecutiveTwoPairs === 5) {
      checkAchievement('even_hands');
    }
  } else if (handRank === '하이카드') {
    consecutiveHighCards++;
    consecutiveTwoPairs = 0;
    if (consecutiveHighCards === 5) {
      checkAchievement('bad_luck');
    }
  } else {
    consecutiveTwoPairs = 0;
    consecutiveHighCards = 0;
  }
}

// 업적 display
export function displayAchievements() {
  console.clear();
  console.log(line20 + ' 업적 목록 ' + line20);
  achievements.forEach((achievement) => {
    const status = achievement.achieved ? chalk.green('달성') : chalk.red('미달성');
    console.log(`${chalk.cyan(achievement.name)} : ${status}`);
    console.log(`달성 조건 : : ${chalk.white(achievement.description)}`);
    console.log();
  });
  console.log(chalk.green('reset = 업적 초기화'));
  console.log(chalk.green('reset 을 정확하게 입력하면 업적 초기화를 진행합니다.'));
  console.log(chalk.green('엔터를 누르면 메인화면으로 돌아갑니다...'));
}
