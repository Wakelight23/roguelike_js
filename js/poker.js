import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
  let middle = '';

  // 숫자나 문자를 왼쪽 상단과 오른쪽 하단에 배치
  const displayValue = value.length === 2 ? value : ` ${value}`;
  const lines = [
    `│${displayValue}     │`,
    empty,
    `│   ${suit}   │`,
    empty,
    `│     ${displayValue.split('').join('')}│`,
  ];

  // 숫자에 따라 심볼 배치
  if ('JQK'.includes(value)) {
    lines[2] = `│   ${value}${suit}  │`;
  } else if (value === 'A') {
    lines[2] = `│   ${suit}   │`;
  } else {
    const num = parseInt(value);
    const symbols = Array(num).fill(suit);
    switch (num) {
      case 2:
        lines[1] = `│   ${suit}   │`;
        lines[3] = `│   ${suit}   │`;
        break;
      case 3:
        lines[1] = `│   ${suit}   │`;
        lines[2] = `│   ${suit}   │`;
        lines[3] = `│   ${suit}   │`;
        break;
      case 4:
        lines[1] = `│ ${suit}   ${suit} │`;
        lines[3] = `│ ${suit}   ${suit} │`;
        break;
      case 5:
        lines[1] = `│ ${suit}   ${suit} │`;
        lines[2] = `│   ${suit}   │`;
        lines[3] = `│ ${suit}   ${suit} │`;
        break;
      case 6:
        lines[1] = `│ ${suit}   ${suit} │`;
        lines[2] = `│ ${suit}   ${suit} │`;
        lines[3] = `│ ${suit}   ${suit} │`;
        break;
      case 7:
        lines[1] = `│ ${suit}   ${suit} │`;
        lines[2] = `│ ${suit} ${suit} ${suit} │`;
        lines[3] = `│ ${suit}   ${suit} │`;
        break;
      case 8:
        lines[1] = `│ ${suit} ${suit} ${suit} │`;
        lines[2] = `│ ${suit}   ${suit} │`;
        lines[3] = `│ ${suit} ${suit} ${suit} │`;
        break;
      case 9:
        lines[1] = `│ ${suit} ${suit} ${suit} │`;
        lines[2] = `│ ${suit} ${suit} ${suit} │`;
        lines[3] = `│ ${suit} ${suit} ${suit} │`;
        break;
      case 10:
        lines[1] = `│ ${suit} ${suit} ${suit} │`;
        lines[2] = `│ ${suit}${suit} ${suit}${suit} │`;
        lines[3] = `│ ${suit} ${suit} ${suit} │`;
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
// function displayHand(hand) {
//   return hand.map(cardToString).join(" ");
// }

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
  const isFlush = new Set(suits).size === 1; // 플러쉬가 된다면
  const isStraight = isStraightHand(values);

  if (isFlush && isStraight) return '스트레이트 플러시';
  if (counts.includes(4)) return '포카드';
  if (counts.includes(3) && counts.includes(2)) return '풀하우스';
  if (isFlush) return '플러시';
  if (isStraight) return '스트레이트';
  if (counts.includes(3)) return '트리플';
  if (counts.filter((count) => count === 2).length === 2) return '투페어';
  if (counts.includes(2)) return '원페어';
  return '하이카드';
}

// 스트레이트 처리 방식
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
  return new Promise((resolve) => {
    console.log('\n현재 핸드: \n' + displayHand(playerHand));
    console.log('            ▼ ▼ ▼ 교환 가능 여부 ▼ ▼ ▼');
    console.log(exchanged.map((e, i) => (e ? ' |교환끝| ' : `|   ${i + 1}   | `)).join(' '));
    rl.question('교환할 카드의 위치를 입력하세요 (1-5), 또는 6을 입력하여 완료: ', (answer) => {
      resolve(parseInt(answer));
    });
  });
}

// 포커를 시작할 때
export async function playPoker() {
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
    const position = await askForExchange(playerHand, exchanged);

    if (position === 6) {
      console.log('카드 교환을 완료합니다.');
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
      console.log('잘못된 입력입니다. 1-6 사이의 숫자를 입력하세요.');
    }
  }

  console.log('\n최종 핸드: \n' + displayHand(playerHand));

  const handRank = evaluateHand(playerHand);
  console.log(`당신의 핸드는 ${handRank}입니다.`);

  rl.close();
}

// 게임 실행
playPoker();
