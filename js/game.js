import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { displayLobby, handleUserInput } from './server.js';
import { playPoker } from './poker.js';
import { displayPokerRankings } from './poker_rankings.js';
import { checkAchievement } from './achievements.js';
import { chooseAbility } from './choice_ability.js';

export class Player {
  constructor() {
    this.level = 1;
    this.maxHp = 200;
    this.currentHp = 200;
    this.minAttackDmg = 5;
    this.maxAttackDmg = 10;
    this.pokerScore = 0; // 포커 점수
    this.def = 0; // 방어력
    this.dog = 0; // 회피율
  }

  // 일반 공격에 대한 계산
  attack(monster) {
    let damage =
      Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) + this.minAttackDmg;

    damage = Math.max(0, damage);

    // 방어구 관통
    let effectiveMonsterDef = monster.def;
    if (this.penetration) {
      effectiveMonsterDef = Math.max(0, effectiveMonsterDef - this.penetration);
    }
    damage = Math.max(0, damage - effectiveMonsterDef);

    // 즉사확률 추가
    if (this.criticalHit && Math.random() < 0.01) {
      monster.currentHp = 0;
      return Infinity;
    }

    // 기본공격 5배
    if (this.increasex5) {
      damage *= 5;
    }

    // 광전사
    if (this.berserk && this.currentHp / this.maxHp <= 0.3) {
      damage = Math.floor(damage * 1.5);
    }

    // 마지막 일격
    if (this.executeAbility && monster.currentHp / monster.maxHp <= 0.2) {
      damage *= 2;
    }

    // 흡혈
    if (this.vampiric) {
      const healing = Math.floor(damage * 0.1);
      this.currentHp = Math.min(this.maxHp, this.currentHp + healing);
    }

    // 연속 공격
    if (this.doubleStrike && Math.random() < 0.2) {
      damage *= 2;
    }

    // 돌진 공격
    if (this.rushAttack) {
      this.currentHp -= Math.floor(damage * 0.1);
    }

    monster.currentHp = Math.max(0, monster.currentHp - damage);
    return damage;
  }

  // 특수공격의 계산 = 카드 슬래쉬
  sAttack(monster) {
    const successRate = 0.8; // 특수공격의 확률 = 80%
    if (Math.random() < successRate) {
      let damage =
        Math.floor(Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1)) +
        this.minAttackDmg +
        (this.pokerMaster ? this.pokerScore * 1.5 : this.pokerScore);
      monster.currentHp = Math.max(0, monster.currentHp - damage);

      damage = Math.max(0, damage);

      // 방어구 관통
      let effectiveMonsterDef = monster.def;
      if (this.penetration) {
        effectiveMonsterDef = Math.max(0, effectiveMonsterDef - this.penetration);
      }
      damage = Math.max(0, damage - effectiveMonsterDef);

      // 돌진공격이 활성화되면
      if (this.rushAttack) {
        this.currentHp -= Math.floor(damage * 0.1);
      }

      // 광전사
      if (this.berserk && this.currentHp / this.maxHp <= 0.3) {
        damage = Math.floor(damage * 1.5);
      }

      // 마지막 일격
      if (this.executeAbility && monster.currentHp / monster.maxHp <= 0.2) {
        damage *= 2;
      }

      // 흡혈
      if (this.vampiric) {
        const healing = Math.floor(damage * 0.1);
        this.currentHp = Math.min(this.maxHp, this.currentHp + healing);
      }

      // 연속 공격
      if (this.doubleStrike && Math.random() < 0.2) {
        damage *= 2;
      }

      return { success: true, damage };
    } else {
      return { success: false, damage: 0 };
    }
  }

  // 능력 : 아이언 스킨의 계산
  takeDamage(damage) {
    // 데미지 감소 10%
    if (this.ironSkin) {
      damage = Math.floor(damage * 0.9); // 10% 감소된 데미지를 정수로 내림
    }
    // 회피 확률 10%
    if (this.evasion && Math.random() < this.evasion) {
      return 0;
    }

    // 강철의 심장 - 피 1 남았을 때 생존
    if (this.surviveOnce && damage >= this.currentHp) {
      this.currentHp = 1;
      this.surviveOnce = false; // 1회성 사용
      return damage;
    }

    this.currentHp = Math.max(0, this.currentHp - damage);
    return damage;
  }

  levelUp() {
    this.level++;
    this.minAttackDmg += 10;
    this.maxAttackDmg += 10;
    this.maxHp += 100;
    this.def += 5;
    this.currentHp = this.currentHp + 100; // 레벨업 시 체력 회복 +100
    if (this.maxAttackDmg >= 500) {
      checkAchievement('high_attack');
    }
    // 레벨 업 했을 때 화면에 표시
    console.log(chalk.green(`레벨 업! 현재 레벨: ${this.level}`));
    const line = chalk.green('━'.repeat(40));
    console.log(line);
    console.log(chalk.green());
    console.log(
      chalk.green(
        `| 플레이어 정보 | Lv: ${chalk.yellow(this.level)} Up!\n` +
          `HP: ${chalk.yellow(this.maxHp)}/${chalk.yellow(this.currentHp)} Up!\n` +
          `공격력: ${chalk.yellow(this.minAttackDmg)}~${chalk.yellow(this.maxAttackDmg)} Up!\n` +
          `특수공격: ${chalk.yellow(this.minAttackDmg + this.pokerScore)}~${chalk.yellow(this.maxAttackDmg + this.pokerScore)} Up!\n ` +
          `방어력: ${chalk.yellow(this.def)} Up!\n`,
      ),
    );
    console.log(line);
  }
}

class Monster {
  constructor(stage) {
    switch (stage) {
      case 1:
        this.name = '클로버 묘목';
        this.maxHp = 100;
        this.minAttackDmg = 10;
        this.maxAttackDmg = 15;
        this.def = 2;
        this.asciiArt = chalk.green(`
          ⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⠢⡠⡠⡐⡠⡀⠀⠀⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⢀⢄⢆⢇⢇⢇⠧⡪⡢⣓⢤⢄⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⢎⢮⢪⢑⢕⢱⢑⢩⢨⢸⢪⠮⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⢾⢣⢣⠣⡣⡱⡡⡣⡣⡱⡱⡻⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⢐⡕⡕⠝⡝⠈⠈⠪⠏⡎⡎⡇⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠺⣜⢵⡠⣠⢠⡰⣸⢜⠮⠠⡐⡔⡀⠀⠀
          ⠀⢔⢄⢇⠧⡄⠀⠀⠀⣡⡚⡅⡌⢏⢆⠁⠀⠑⢸⠚⠌⠀⠀
          ⠀⢸⣰⠰⡱⡡⠀⠀⣔⡐⠅⠃⠊⠊⡅⡥⡠⡠⠂⠀⠀⠀⠀
          ⠀⠀⠈⠙⠎⠇⣔⢜⡒⠍⡃⡂⠆⡊⠪⢪⠪⡄⡀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠈⠚⢧⢡⢊⢄⢆⢕⢄⢣⢨⠳⠱⠑⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠈⠪⡺⣔⢕⢜⣔⢧⠣⠁⠀⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⡕⣔⢅⡔⣔⡱⠀⠀⠀⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⢸⢪⢪⢲⠍⠀⠀⠀⠀⠀⠀⠀⠀
          ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠃⠁⠃⠁⠀⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      case 2:
        this.name = '헬스피어럴';
        this.maxHp = 200;
        this.minAttackDmg = 20;
        this.maxAttackDmg = 30;
        this.def = 5;
        this.asciiArt = chalk.blueBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠌⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣜⠌⢌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⡑⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣗⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣔⢜⠀⡢⡱⡑⡕⡀⠀⠀⡰⡸⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⣞⡞⡆⡎⡢⡃⢇⢕⢢⠰⣵⡻⣆⠀⠀⠀⠀
⠀⠀⠀⠀⢐⢕⡢⡣⡃⢎⢆⢇⢣⢊⣆⠄⡂⡑⢰⣑⠀⠀⠀
⠀⠀⠀⠀⠘⢿⡸⡢⢣⢑⠕⢔⠥⡱⡸⣟⡾⣞⣷⡃⠀⠀⠀
⠀⠀⠀⢰⣳⣽⢚⢎⢧⢳⢹⡪⣺⢪⡯⡯⣯⡷⣝⡽⡠⠀⠀
⠀⠀⠀⢼⢫⢻⠇⣟⢼⢜⡮⣗⡷⡻⡼⡹⡸⡽⡟⠋⠂⠀⠀
⠀⠀⠀⠘⣷⣵⡸⣣⣿⣽⣽⣗⢍⢝⢸⠸⡱⡁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠘⢹⣾⣻⡾⢿⣮⣦⣃⡇⡝⣳⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠁⠀⠙⢾⣻⣏⠋⠃⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⡴⣜⢞⣿⣻⢆⠀⠀⠈⣯⣷⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠋⠛⠙⠝⠫⠛⠖⢶⢯⡺⣮⢞⣦⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠋⠉⠊⠁⠀⠀⠀⠀
        `);
        break;
      case 3:
        this.name = '롱테이르캣';
        this.maxHp = 250;
        this.minAttackDmg = 25;
        this.maxAttackDmg = 40;
        this.def = 8;
        this.asciiArt = chalk.yellowBright(`
        ⠀⠀⠀⠀⠀⠀⠀⡪⡄⠀⠀⠀⢀⠄⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⡯⡮⡂⡔⣼⡪⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠨⣺⢺⣜⢼⣺⡄⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠄⠌⡊⢌⢮⢷⢽⢵⡷⡧⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⢂⠢⠡⡑⡄⡕⡽⡽⡽⡯⣟⣷⠀⠀⠀
⠀⠀⠀⠀⠀⢀⢂⠅⡢⡑⡕⢜⢔⢝⣎⢯⢯⣻⢽⡞⠀⠀⠀
⠀⠀⠀⠀⠀⡬⣢⢕⢆⣗⢮⡳⣝⢵⡳⡽⣽⣺⡯⠇⠀⠀⠀
⠀⢠⠐⠲⡀⢽⣺⣪⣳⢵⣫⣟⢮⣳⣟⣿⡽⡷⠋⠀⠀⠀⠀
⠠⡣⠀⠀⢰⡻⢵⣻⢾⢽⢾⡽⣕⣗⢿⣞⣿⠍⠀⠀⠀⠀⠀
⠀⢳⢤⣲⠟⠀⠙⡾⣽⣫⢿⣻⡒⡢⢸⡯⡗⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢼⣗⣯⣿⡻⠸⡐⠈⣯⡃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠻⣳⠈⠺⣄⢜⠌⠨⣷⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢻⡢⠀⠙⡮⡊⠀⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠠⡪⣎⢦⣄⡎⣎⣆⢿⢵⣲⡤⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠁⠈⠀⠀⠁⠁⠁⠁⠁⠁⠈⠀⠀⠀⠀
        `);
        break;
      case 4:
        this.name = '달라딘';
        this.maxHp = 500;
        this.minAttackDmg = 20;
        this.maxAttackDmg = 30;
        this.def = 50;
        this.asciiArt = chalk.yellowBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡺⡂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡄⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢰⡀⡀⢠⣀⣾⢃⣿⣅⡄⡀⣀⡆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣟⢴⢅⡝⠮⢁⠗⣝⢴⡜⢾⠖⡶⢶⣤⡀⠀
⠀⠀⠀⠀⠀⠀⢸⣝⣿⣏⢧⢣⢧⡹⣿⣟⢴⣪⡼⣖⡽⡇⠀
⠀⠀⠀⠀⠀⣘⡷⣾⠃⢹⡪⣣⢧⡽⠁⢿⣺⣵⣿⣟⣿⡇⠀
⠀⢤⣄⠀⠀⡸⣪⢏⣠⠾⣟⢷⣫⡿⣆⠈⢿⣮⣟⣵⠟⠀⠀
⠀⠈⠉⠛⢦⣻⣧⡾⡳⣕⣿⢑⡝⣶⢚⡷⡀⠙⠾⠋⠀⠀⠀
⠀⠀⠀⠀⠈⡵⢻⡝⡵⡞⢷⠱⡸⣟⡵⡹⣇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠚⠁⣸⡕⣽⢏⣻⠀⡱⡕⣿⣎⢻⡄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠏⠊⠀⣼⡨⣷⣏⢸⡇⠻⣜⢧⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡻⣿⢞⣿⠅⠀⠀⠑⠹⢱⡢⣀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⠎⣟⡎⠀⠀⠀⠀⠀⠀⠈⠈⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⡀⢺⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⢫⠇⣟⠝⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠒⠉⠀⠈⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      case 5: // 중간 보스
        this.name = 'Mid_Boss:하로트';
        this.maxHp = 800;
        this.minAttackDmg = 60;
        this.maxAttackDmg = 80;
        this.def = 30;
        this.asciiArt = chalk.redBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠀⠀⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣀⣀⠀⠀⠀⠀⣶⣁⠐⣒⠐⣯⣳⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠉⡣⣀⡀⠀⠀⠻⢥⡣⠌⢎⢜⠉⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠻⣕⠏⠀⢴⠶⡶⣳⡤⢖⠏⠾⣔⣕⢦⠀⠀⠀⠀⠀
⠀⠀⠀⢠⣄⣤⠀⠘⡷⡡⣢⢈⢮⣗⣴⣹⠊⢫⡂⢀⠔⠃⠀
⠀⠀⠀⠀⠀⠈⠑⢝⡏⠿⣌⢳⡃⠠⣴⣉⣳⣎⠷⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⢀⣾⠇⣶⢟⠦⣪⡽⡳⢳⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢠⡟⣝⢟⣮⠛⢦⡼⡀⠀⠀⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⣿⠀⣝⢧⡻⠀⠀⠘⣗⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⢔⣪⣿⣿⣷⣬⢗⢿⣤⢄⣾⡇⢝⠷⡄⠀⠀⠀⠀
⠀⡠⣊⡼⠳⢱⡿⣿⣜⣷⡍⣸⣿⡁⡹⣿⡘⠆⠹⣧⠀⠀⠀
⠀⠋⠊⠀⠀⠚⠀⠹⠱⣟⣎⡷⠙⢯⡪⣹⣯⡿⣾⡿⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢨⡏⠰⠁⠀⠀⢫⠌⠙⠉⠉⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢠⣿⡷⠀⠀⠀⠀⢸⡨⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠐⠛⠁⠀⠀⠀⠀⠀⢨⡙⠂⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      case 6:
        this.name = '세이란드';
        this.maxHp = 600;
        this.minAttackDmg = 120;
        this.maxAttackDmg = 150;
        this.def = 5;
        this.asciiArt = chalk.greenBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢤⢄⠄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢢⢱⡡⡀⠀⡐⢅⠄⢀⢔⡕⠏⠆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠁⠁⠑⠽⡵⡨⠢⡑⡵⣃⢁⡀⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣠⠰⡘⢔⢑⢌⢬⡨⡯⡺⠕⠀⠀⠀⠀⠀
⠀⠀⠀⢀⠀⠈⠮⢮⣻⢮⠧⠣⠂⢗⢏⠋⠉⠀⠀⠀⠀⠀⠀
⠀⠀⢜⠰⡑⠄⠀⠀⠀⠨⡻⢢⠲⡹⡡⠀⠀⠀⢀⠀⠀⠀⠀
⠀⠀⠈⠊⠊⢱⢰⠀⠪⣢⡀⠇⢏⠖⢄⡅⠎⠀⢊⠄⠀⠀⠀
⠀⠀⠀⠀⡤⠀⡃⢇⠆⣊⠺⡢⡣⡱⡛⠬⡠⡐⠌⠀⡂⠀⠀
⠀⠀⠀⢸⣕⠀⠀⠀⡁⠐⠀⠀⠡⠑⠀⠐⢄⡤⡠⡢⠂⠀⠀
⠀⠀⠀⠈⠪⢟⢮⡳⡁⢀⠀⠂⠀⡀⠠⠐⢨⣫⡁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠢⢅⠀⠈⠐⡴⣄⡦⣄⢦⠈⢀⠳⠁⡐⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢨⡳⡫⡎⡇⠀⡀⠀⠀⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠠⠠⠀⡪⣞⡝⡎⡆⠀⠈⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡯⣺⠪⡨⢊⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠸⡑⢌⠪⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠃⠑⠀⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      case 7:
        this.name = '샤프클로';
        this.maxHp = 800;
        this.minAttackDmg = 80;
        this.maxAttackDmg = 100;
        this.def = 30;
        this.asciiArt = chalk.magentaBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢱⡀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⠀⡐⢁⠌⡈⠢⠐⡀⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣖⢤⠪⡁⠨⠂⡼⢄⠑⠔⡨⢐⠄⣠⠊⠀⠀⠀
⠀⠀⠀⠀⠀⢨⡳⡕⡨⢊⠂⢢⠠⡑⡁⢞⡵⢇⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⡯⡸⡢⡕⣡⢣⢒⢕⢥⢳⡩⢂⢕⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢘⣷⡙⣾⢾⢷⡿⣧⡫⡳⡱⢧⡳⡌⡀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⢧⣫⢻⡳⣟⡝⣯⢪⠏⠳⠀⠙⠖⡑⠀⠀⠀
⠀⠀⠀⢠⢔⢯⣳⢽⢮⣕⢞⢶⢕⠧⡑⡡⠂⢮⢈⠌⢒⠀⠀
⠀⠀⠱⣡⢊⣿⢵⣻⡷⠍⠙⠁⠻⣕⢧⡸⠅⠀⠓⢓⠵⠀⠀
⠀⠀⠀⠈⠀⠀⢹⣿⣆⠀⠀⠀⠀⣻⣵⠋⡠⢐⠁⠎⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡏⡮⣙⡆⠀⠀⢴⡛⡿⣂⠔⡡⡑⠁⠀⠀⠀
⠀⠀⠀⠀⢠⡾⡹⡞⠁⠀⠀⠀⠙⣮⠻⡼⡬⡪⢚⠀⠀⠀⠀
⠀⠀⠀⠀⠓⠉⠁⠀⠀⠀⠀⠀⠀⠫⣛⢕⠆⠈⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      case 8:
        this.name = '다이아 골렘';
        this.maxHp = 800;
        this.minAttackDmg = 60;
        this.maxAttackDmg = 60;
        this.def = 130;
        this.asciiArt = chalk.cyanBright(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⢀⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢔⠠⡐⠤⡡⠠⡐⢕⠄⣧⢝⢦⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⠦⡑⠊⢠⣘⢬⢈⢎⡎⣮⢳⡅⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⡔⠀⠁⢀⢄⠇⠡⡈⢂⠃⡨⢑⢇⠤⡀⠀⠀⠀⠀⠀
⠀⠀⢸⡷⣝⢦⢢⢵⢠⡑⡌⡪⡒⢄⢗⢼⡣⡻⡄⠀⠀⠀⠀
⠀⠀⠙⣽⢯⡿⡳⠷⢣⣳⢜⡼⣌⣗⡽⠚⣷⢻⡃⠀⠀⠀⠀
⠀⠀⠀⠈⢳⡿⣝⠓⢀⣯⡻⡺⣳⣝⡅⠠⣎⣳⢆⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠉⠀⠀⡰⢉⠋⠛⢘⠃⢧⠀⡿⣽⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⡀⠢⠂⡹⡕⡏⠐⢄⢑⡞⣾⣣⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣰⢞⣴⡥⣺⠀⣗⡵⡶⣺⣭⣻⣽⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⡩⢌⠨⡺⡟⠀⢻⡍⢔⢴⢕⠁⠊⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢺⣴⣯⣾⠀⠀⠀⣾⢯⣾⡯⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢼⡿⣮⡿⠀⠀⠀⣻⣟⡾⣇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡀⡘⣛⢗⣏⠀⠀⠀⣾⣍⡯⣰⠱⡦⠀⠀⠀⠀
⠀⠀⠀⠀⠰⢯⢾⡼⠗⠋⠀⠀⠀⠉⠉⠉⠋⠛⠉⠀⠀⠀⠀

        `);
        break;
      case 9:
        this.name = '혼도스';
        this.maxHp = 1200;
        this.minAttackDmg = 50;
        this.maxAttackDmg = 80;
        this.def = 100;
        this.asciiArt = chalk.grey(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠁⠀⡰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⢼⡃⠀⣞⣝⡀⠀⢀⣤⠤⠊⠙⢷⡄⠀
⠀⠀⠀⠀⠀⠀⠀⠈⣯⣿⠤⢽⣮⣿⣀⡿⣫⢿⠞⠃⠐⠂⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢿⣕⣦⡧⣣⢳⣽⠄⠙⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠲⣠⣰⡿⡝⢺⠧⢳⢋⢄⠝⢰⠄⠀⠀⠀⠀⠀
⠀⠀⠀⡞⢼⣿⣽⢿⡝⢎⠓⡽⣽⢄⡣⣪⣣⣻⠄⠀⠀⠀⠀
⠀⣬⡛⠵⢻⣷⢻⣗⠕⡑⣅⢳⡴⣉⢯⣵⣯⢿⣦⠀⡻⠂⠀
⠀⠀⠈⠁⠘⠳⠽⣷⢬⢢⢝⢟⢥⡫⡳⣜⣷⢛⢾⢇⢹⠀⠀
⠀⠀⠀⠀⠀⠀⣴⣿⡳⣷⢵⣟⣟⡾⣽⢗⣿⣱⣹⡮⠞⠀⠀
⠀⢰⡦⠀⢀⣼⡻⡾⡽⣯⣿⢯⣺⣯⢻⣫⣟⠡⣻⡅⠀⠀⠀
⠀⠀⢿⣶⣿⣳⣝⣿⣂⠘⢿⣻⣯⣾⣢⣳⣧⣣⠙⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣨⣿⣽⡄⠀⠀⠉⠈⠈⠑⢿⣷⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠙⠋⠚⠁⠁⠀⠀⠀⠀⠀⢀⣾⢽⣧⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠈⠃⠉⠃⠀⠀⠀⠀
        `);
        break;
      case 10: // 최종 보스
        this.name = 'Boss:클라디아';
        this.maxHp = 3000;
        this.minAttackDmg = 100;
        this.maxAttackDmg = 200;
        this.def = 80;
        this.asciiArt = chalk.greenBright(`
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠲⣀⠀⠀⠀⠀⠀⠀⢠⣣⣀⡰⠜⠀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠓⣤⡀⡀⠀⣠⠪⢂⠅⡓⣥⡀⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠐⢮⡳⣽⡸⣖⠥⠑⠌⡆⣗⡇⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⡇⢌⠣⠯⡳⡳⡔⢴⣹⡺⠀⠀⠀⢀⡆⠀⠀⠀⠀
        ⠀⠀⠀⢠⡣⡣⡣⣱⢈⠂⠀⠐⠰⡙⢔⠔⠔⠑⠈⠀⢀⣀⠀
        ⠀⠀⠀⠀⠉⠉⠚⠈⢃⣄⣢⡨⣸⢔⡐⢅⠢⠀⠀⠀⠀⡘⡆
        ⠀⠀⠀⠀⠀⠀⠀⢠⣆⢯⢣⣅⡯⣗⢜⣼⣑⠀⠀⠀⠀⠸⠀
        ⠀⠀⠀⠀⠀⠀⢀⡴⣧⣳⣹⣞⢾⣥⠁⠫⢺⢵⣄⠀⢠⠁⠀
        ⠀⠀⠀⠀⠀⠀⣜⢼⣺⣺⢵⢯⢮⠬⣇⠄⠀⠑⢝⡽⣢⢀⠀
        ⠀⠀⠀⡈⡦⡪⡪⡸⣺⡺⡽⡝⢣⠱⡹⡹⠒⠒⠁⠈⠓⠱⠀
        ⠀⠀⠐⠁⠙⢼⡸⡨⡢⣮⢲⢪⢪⢪⢪⢺⢢⢀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⢳⣽⠉⠀⠉⠑⢳⣽⠅⠈⠃⠑⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠀⢽⠅⠀⠀⠀⠀⠀⢟⡅⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠠⣫⠀⠀⠀⠀⠀⠀⢸⢥⠀⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠜⡵⠀⠀⠀⠀⠀⠀⠨⢯⡂⠀⠀⠀⠀⠀⠀⠀
        ⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠑⠑⠀⠀⠀⠀⠀⠀⠀
        `);
        break;
      default:
        throw new Error('Invalid stage number');
    }
    this.currentHp = this.maxHp;
  }

  attack(player) {
    const damage = Math.floor(
      Math.random() * (this.maxAttackDmg - this.minAttackDmg + 1) + this.minAttackDmg - player.def,
    );
    const actualDamage = player.takeDamage(Math.max(0, damage));
    return actualDamage;
  }
}

// Player, Monster의 정보를 시각적으로 표현
function displayStatus(stage, player, monster) {
  const screenWidth = 100; // 전체 화면 너비
  const line = chalk.magentaBright('━'.repeat(screenWidth));

  console.clear();
  console.log(line);

  // 플레이어 정보 (왼쪽)
  const playerInfo = [
    chalk.blueBright(`| 플레이어 정보 | Lv:${player.level}`),
    chalk.blueBright(`HP: ${player.maxHp}/${player.currentHp}`),
    chalk.blueBright(`공격력: ${player.minAttackDmg}~${player.maxAttackDmg}`),
    chalk.blueBright(
      `특수공격: ${player.minAttackDmg + player.pokerScore}~${player.maxAttackDmg + player.pokerScore}`,
    ),
    chalk.blueBright(`방어력: ${player.def}`),
  ];

  // 몬스터 정보 (오른쪽)
  const monsterInfo = [
    chalk.redBright(`| 몬스터 정보 | Stage: ${stage}`),
    chalk.redBright(`      개체명: ${monster.name}`),
    chalk.redBright(`   HP: ${monster.maxHp}/${monster.currentHp}`),
    chalk.redBright(`  공격력: ${monster.minAttackDmg}~${monster.maxAttackDmg}`),
    chalk.redBright(`   방어력: ${monster.def}`),
  ];

  // 정보 표시
  const maxInfoLines = Math.max(playerInfo.length, monsterInfo.length);
  for (let i = 0; i < maxInfoLines; i++) {
    const leftInfo = playerInfo[i] || ' '.repeat(40);
    const rightInfo = monsterInfo[i] || ' '.repeat(50);
    console.log(leftInfo.padEnd(50) + rightInfo.padEnd(50));
  }

  // 구분선 추가
  console.log(line);

  // 몬스터 ASCII 아트를 중앙에 표시
  const monsterArt = monster.asciiArt.split('\n');
  monsterArt.forEach((line) => {
    // 각 라인을 중앙 정렬하여 출력
    console.log(line.padStart((screenWidth + line.length) / 2).padEnd(screenWidth));
  });

  console.log(line);

  // 플레이어의 능력 표시
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
    const escapeChancePersent = calculateEscapeChance(monster);

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
        `1.일반공격 | 2.카드 슬래시(명중률 : 80%) | 3.방어 | 4.도망가기(${Math.ceil(escapeChancePersent * 100)}%) |\n100.족보확인 | 998.게임로그 | 999.포기하기(게임종료)`,
      ),
    );
    console.log(
      chalk.green(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`),
    );

    // 플레이어의 선택에 따라 다음 행동 처리
    // 타임 스탬프를 찍어서 어떤 것을 최근의 선택했는지 알 수 있도록
    const choice = readlineSync.question('당신의 선택은? ');
    const timestamp = formatTime(new Date());

    // 유효한 선택지 목록
    const validChoices = ['1', '2', '3', '4', '100', '998', '999'];

    if (!validChoices.includes(choice)) {
      const invalidLog = `[${timestamp}] ${chalk.red(`잘못된 입력: ${choice}`)}`;
      logs.push(invalidLog);
      fullLogs.push(invalidLog);
      continue; // 턴을 소비하지 않고 다시 선택지로 돌아감
    }

    // 올바른 선택지를 선택했다면
    const newLog = `[${timestamp}] ${chalk.green(`${choice}를 선택하셨습니다.`)}`;
    logs.push(newLog);
    fullLogs.push(newLog);

    // 자연 회복 적용
    if (player.naturalHealing) {
      const healAmount = Math.floor(player.maxHp * 0.1);
      player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
      logs.push(
        `[${timestamp}] ${chalk.green(`자연 회복으로 ${healAmount}만큼 체력을 회복했습니다.`)}`,
      );
    }

    switch (choice) {
      // 1. 일반 공격
      case '1':
        const playerDamage = player.attack(monster);
        const playerAttackLog = `[${timestamp}] ${chalk.yellow(`플레이어가 몬스터에게 ${playerDamage}의 데미지를 입혔습니다.`)}`;
        if (player.attack(monster) >= 99999) {
          console.log(chalk.yellow(`급소 공격!! 몬스터가 즉사합니다.`));
        }

        logs.push(playerAttackLog);
        fullLogs.push(playerAttackLog);
        if (monster.currentHp === 0) {
          console.log(chalk.yellow('몬스터를 물리쳤습니다!'));
          return true; // 전투 승리
        }
        break;
      // 2.특수공격
      case '2':
        const attackResult = player.sAttack(monster);
        if (attackResult.success) {
          const playerSAttLog = `[${timestamp}] ${chalk.yellow(`카드 슬래시!!! ${attackResult.damage}의 데미지를 입혔습니다. (포커 점수: ${player.pokerScore})`)}`;
          logs.push(playerSAttLog);
          fullLogs.push(playerSAttLog);
          if (monster.currentHp === 0) {
            console.log(chalk.yellow('몬스터를 물리쳤습니다!'));
            return true; // 전투 승리
          }
        } else {
          const missLog = `[${timestamp}] ${chalk.yellow('공격이 빗나갔습니다!')}`;
          logs.push(missLog);
          fullLogs.push(missLog);
        }
        break;
      // 방어하기
      case '3':
        // 방어하기
        const originalDef = player.def;
        player.def *= player.defenseExpert ? 5 : 2; // 방어 전문가는 5배, 아니면 2배
        player.def *= 4;
        const defLog = `[${timestamp}] ${chalk.blue(`몬스터의 공격에 대비합니다`)}`;
        logs.push(defLog);
        fullLogs.push(defLog);
        // 몬스터의 공격
        const monsterDamage = monster.attack(player);
        const monsterDmgLog = `[${timestamp}] ${chalk.red(`몬스터가 플레이어에게 ${monsterDamage}의 데미지를 입혔습니다.`)}`;
        logs.push(monsterDmgLog);
        fullLogs.push(monsterDmgLog);
        // 카운터 어택 - 방어 했을 때 데미지 반사하는 능력
        if (player.counterAttack) {
          const reflectDamage = Math.floor(monsterDamage * 0.5);
          monster.currentHp = Math.max(0, monster.currentHp - reflectDamage);
          logs.push(
            `[${timestamp}] ${chalk.yellow(`카운터 공격으로 몬스터에게 ${reflectDamage}의 데미지를 반사했습니다.`)}`,
          );
        }
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
        // 999. 게임포기 (게임종료)
        console.log('시작 화면으로 돌아갑니다...');
        readlineSync.question('엔터를 누르면 시작 화면으로 돌아갑니다...');
        displayLobby();
        return 'quit'; // 배틀 함수를 완전히 종료하는 신호
      default:
        console.log('잘못된 입력입니다. 선택지에 있는 번호만 입력해주세요');
        break;
    }
    if (
      monster.currentHp > 0 &&
      choice != '3' &&
      choice != '998' &&
      choice != '999' &&
      choice != '100' &&
      choice != ''
    ) {
      const monsterDamage = monster.attack(player);
      const actualDamage = player.takeDamage(monsterDamage);
      const monsterAttackLog = `[${timestamp}] ${chalk.red(`몬스터가 플레이어에게 ${actualDamage}의 데미지를 입혔습니다.`)}`;
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
  // 대화 스크립트
  console.log("이 게임은 'Poker Roguelike' 입니다.");
  console.log('포커에서 나오는 패에 따라서 당신의 플레이가 결정될 것입니다.');
  console.log('또한 랜덤 능력 또한 플레이에 영향을 줄 수 있습니다...');
  console.log('오롯이 랜덤에 의해 게임이 진행될 것입니다.');
  console.log('그럼 게임 방법에 대해 설명해 드리겠습니다.');
  console.log('Press Enter...');
  readlineSync.question('');

  console.clear();
  console.log('1. 이 게임은 기본적으로 Five Poker로 진행됩니다.');
  console.log("   처음 나온 패를 보고 맘에 들지 않는다면 단 '1회'만 교환할 수 있습니다.");
  console.log('   하지만... 진행을 하다보면 좀 더 교환 할 수 있을지도 모르죠.');
  console.log('   모든 교환을 완료하면 자동으로 스테이지가 시작됩니다.');
  console.log('   족보에 대해 궁금하다면 처음 화면이나 몬스터 배틀 메뉴에서 확인해주세요!\n');
  console.log('2. 레벨업을 할 때마다 능력을 선택할 수 있습니다.');
  console.log(
    `   능력의 종류는 ${chalk.white('커먼')},${chalk.green('언커먼')},${chalk.blue('레어')},${chalk.magenta('에픽')},${chalk.yellow('레전더리')}로 색깔로 구분되어 있습니다.`,
  );
  console.log('   조합에 따라 게임이 수월하게 진행될 수도 운에 따라 어려워질 수 있습니다.\n');
  console.log('그럼 이제 처음의 능력치를 정할 포커를 시작하겠습니다...!!');
  console.log('Press Enter...');
  readlineSync.question('');

  console.clear();
  const player = new Player();

  console.log(chalk.yellow('! Poker Start !'));
  const initialPokerResult = playPoker(player);
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
    if (battleResult === 'quit') {
      break; // startGame 함수를 종료하고 메인 화면으로 돌아감
    }
    // battle()에서 나온 결과물에 따라서
    if (battleResult === false) {
      checkAchievement('first_game_over');
      console.log(chalk.red('게임 오버! 메인 메뉴로 돌아갑니다.'));
      break;
    } else if (battleResult === 'escape') {
      console.log(chalk.yellow('도망에 성공했습니다. 스테이지에서 벗어납니다.'));
      console.log(chalk.yellow('도망간 자에게는 포커 게임의 기회는 없습니다.'));
      stage--;
      continue; // 포커 게임을 건너뛰고 다음 스테이지로
    }

    // 스테이지를 클리어 했을 때
    console.log(chalk.green(`스테이지 ${stage} 클리어!`));

    // 레벨 업 조건 확인
    if (
      (stage === 1 && player.level === 1) ||
      (stage === 2 && player.level === 2) ||
      (stage === 4 && player.level === 3) ||
      (stage === 5 && player.level === 4) ||
      (stage === 7 && player.level === 5) ||
      (stage === 9 && player.level === 6)
    ) {
      player.levelUp();
      readlineSync.question('');
      chooseAbility(player);
    }

    if (stage === 10) {
      // Game Clear
      checkAchievement('game_clear');
      console.log(chalk.cyanBright('\n===== ★★★ Game Clear ★★★ ====='));
      console.log(chalk.green('축하합니다! 모든 스테이지를 클리어하셨습니다.'));
      console.log(chalk.yellow('시작화면으로 돌아갑니다. 엔터를 눌러주세요...'));
      readlineSync.question('');
      displayLobby();
      handleUserInput();
      return; // 메인화면으로 돌아간다
    }

    stage++;

    // 마지막 스테이지가 아닐 때만 포커 게임 진행
    if (stage <= 10) {
      console.log(chalk.yellow('포커 게임을 시작합니다... (Press Enter)'));
      readlineSync.question('');
      // 스테이지 클리어 후 포커 게임 시작
      const pokerResult = playPoker(player);
      player.pokerScore += pokerResult.score;
      console.log(chalk.yellow(`현재 누적 포커 점수: ${player.pokerScore}`));
    }
  }

  readlineSync.question('');
  displayLobby();
  handleUserInput();
}
