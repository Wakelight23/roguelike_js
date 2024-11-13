import readlineSync from 'readline-sync';
import { displayLobby } from './server.js';
import chalk from 'chalk';

// 포커 카드 덱을 생성
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }

  return deck;
}

// 덱 섞기
// Fisher-Yates 알고리즘 사용
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// 카드 문자열 표현
function cardToString(card) {
  return createCardVisual(card.value, card.suit);
}

function createCardVisual(value, suit) {
  const topBottom = `┌───────┐\n└───────┘`;
  const empty = `│       │`;

  // 슈트에 따른 색상 적용
  let coloredSuit;
  switch (suit) {
    case '♥':
      coloredSuit = chalk.redBright(suit);
      break;
    case '♦':
      coloredSuit = chalk.magentaBright(suit);
      break;
    case '♣':
      coloredSuit = chalk.greenBright(suit);
      break;
    case '♠':
      coloredSuit = chalk.blueBright(suit);
      break;
  }

  // 숫자나 문자를 왼쪽 상단과 오른쪽 하단에 배치
  const displayValue = value.length === 2 ? value : ` ${value}`;
  const lines = [
    `│${displayValue}     │`,
    empty,
    `│   ${coloredSuit}   │`,
    empty,
    `│     ${displayValue.split('').join('')}│`,
  ];

  // 숫자에 따라 심볼 배치
  if ('JQK'.includes(value)) {
    lines[2] = `│  ${value}${coloredSuit}   │`;
  } else if (value === 'A') {
    lines[2] = `│   ${coloredSuit}   │`;
  } else {
    const num = parseInt(value);
    switch (num) {
      case 2:
        lines[1] = `│   ${coloredSuit}   │`;
        lines[3] = `│   ${coloredSuit}   │`;
        break;
      case 3:
        lines[1] = `│   ${coloredSuit}   │`;
        lines[2] = `│   ${coloredSuit}   │`;
        lines[3] = `│   ${coloredSuit}   │`;
        break;
      case 4:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 5:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│   ${coloredSuit}   │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 6:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 7:
        lines[1] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit}   ${coloredSuit} │`;
        break;
      case 8:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}   ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
      case 9:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
      case 10:
        lines[1] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        lines[2] = `│ ${coloredSuit}${coloredSuit} ${coloredSuit}${coloredSuit} │`;
        lines[3] = `│ ${coloredSuit} ${coloredSuit} ${coloredSuit} │`;
        break;
    }
  }

  return topBottom.split('\n')[0] + '\n' + lines.join('\n') + '\n' + topBottom.split('\n')[1];
}

// 핸드 표시
function displayHand(hand) {
  const cardVisuals = hand.map((card) => createCardVisual(card.value, card.suit).split('\n'));
  let display = '';
  for (let i = 0; i < cardVisuals[0].length; i++) {
    display += cardVisuals.map((card) => card[i]).join(' ') + '\n';
  }
  return display;
}

// 카드 한 장 뽑기
function drawCard(deck) {
  return deck.pop();
}

// 핸드 평가 함수
function evaluateHand(hand) {
  const values = hand.map((card) => card.value);
  const suits = hand.map((card) => card.suit);

  // 값별 카운트
  const valueCounts = {};
  values.forEach((value) => {
    valueCounts[value] = (valueCounts[value] || 0) + 1;
  });

  const counts = Object.values(valueCounts);
  const isFlush = new Set(suits).size === 1;
  const isStraight = isStraightHand(values);

  // 로얄 스트레이트 플러시 확인
  const isRoyalStraightFlush =
    isFlush &&
    isStraight &&
    new Set(values).size === 5 &&
    values.includes('A') &&
    values.includes('K');

  if (isRoyalStraightFlush) return chalk.bgRed('로얄 스트레이트 플러시'); // *16.0
  if (isFlush && isStraight) return chalk.bgYellow('스트레이트 플러시'); // * 8.0
  if (counts.includes(4)) return chalk.greenBright('포카드'); // * 4.0
  if (counts.includes(3) && counts.includes(2)) return chalk.blue('풀하우스'); // *3.0
  if (isFlush) return chalk.blueBright('플러시'); // * 2.5
  if (isStraight) return chalk.blueBright('스트레이트'); // *2.0
  if (counts.includes(3)) return chalk.whiteBright('트리플'); // *1.5
  if (counts.filter((count) => count === 2).length === 2) return chalk.whiteBright('투페어'); // *1.2
  if (counts.includes(2)) return chalk.whiteBright('원페어'); // *1.1
  return chalk.grey('하이카드'); // *1.0
}

function isStraightHand(values) {
  const order = 'A23456789TJQKA';
  const sortedValues = values
    .map((v) => (v === '10' ? 'T' : v))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const indices = sortedValues.map((v) => order.indexOf(v));
  return (
    indices.every((v, i) => i === 0 || v === indices[i - 1] + 1) ||
    (indices[0] === 0 && indices[1] === 9 && indices[4] === 12)
  ); // A-10-J-Q-K 스트레이트 처리
}

// 1회만 교환할 수 있다
function askForExchange(playerHand, exchanged) {
  console.log('\n현재 핸드: \n' + displayHand(playerHand));
  console.log(' ▼ ▼ ▼ 교환 가능 여부 ▼ ▼ ▼');
  console.log(
    exchanged
      .map((e, i) => (e ? chalk.redBright(' |교환끝| ') : chalk.blueBright(`| ${i + 1} | `)))
      .join(' '),
  );
  const answer = readlineSync.question(
    '교환할 카드의 위치를 입력하세요 (1-5), 또는 111을 입력하여 완료 \n 입력 : ',
  );
  return parseInt(answer);
}

// 카드 점수 계산 함수
function calculateCardScore(card) {
  if (card.value === 'A') return 14;
  if (card.value === 'K') return 13;
  if (card.value === 'Q') return 12;
  if (card.value === 'J') return 11;
  return parseInt(card.value);
}

// 핸드 랭크에 따른 배율 계산 함수
function getHandRankMultiplier(handRank) {
  switch (handRank) {
    case '로얄 스트레이트 플러시':
      return 16.0;
    case '스트레이트 플러시':
      return 8.0;
    case '포카드':
      return 4.0;
    case '풀하우스':
      return 3.0;
    case '플러시':
      return 2.5;
    case '스트레이트':
      return 2.0;
    case '트리플':
      return 1.5;
    case '투페어':
      return 1.2;
    case '원페어':
      return 1.1;
    default:
      return 1.0; // 하이카드
  }
}

// pokerScore 계산 함수
function calculatePokerScore(hand, handRank) {
  const cardScoreSum = hand.reduce((sum, card) => sum + calculateCardScore(card), 0);
  const multiplier = getHandRankMultiplier(handRank);
  return Math.floor(cardScoreSum * 0.1 * multiplier);
}

// 포커를 시작할 때
export function playPoker() {
  let deck = createDeck();
  shuffleDeck(deck);

  let playerHand = [];
  for (let i = 0; i < 5; i++) {
    playerHand.push(drawCard(deck));
  }

  console.log('초기 핸드: \n' + displayHand(playerHand));

  // 카드 교환
  let exchanged = new Array(5).fill(false);

  while (true) {
    const position = askForExchange(playerHand, exchanged);

    if (position === 111) {
      console.log(chalk.yellow('카드 교환을 완료합니다.'));
      break;
    }

    if (position >= 1 && position <= 5) {
      if (!exchanged[position - 1]) {
        console.log(`${position}번째 카드를 교환합니다.`);
        playerHand[position - 1] = drawCard(deck);
        exchanged[position - 1] = true;
      } else {
        console.log(`${position}번째 카드는 이미 교환했습니다. 다른 카드를 선택하세요.`);
      }
    } else {
      console.log('잘못된 입력입니다. 1-5 사이의 숫자를 입력하세요.');
    }
  }

  console.log('\n최종 핸드: \n' + displayHand(playerHand));
  const handRank = evaluateHand(playerHand);
  console.log(`당신의 핸드는 ${handRank}입니다.`);

  const pokerScore = Math.ceil(calculatePokerScore(playerHand, handRank));
  console.log(`이번 라운드의 포커 점수: ${pokerScore}`);

  // 최종 핸드와 포커 점수 반환
  return { hand: playerHand, score: pokerScore };
}
