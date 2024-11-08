# JavaScript로 로그라이크 게임 만들기

# 기본적인 요소

1.  확률 로직 적용

- 연속 공격, 방어, 도망치기
- 스테이지 클리어 시 플레이어 능력치 증가, 증가량
- 몬스터의 공격력, 체력 증가량

2. 복잡한 행동 패턴 구현 (=Skill)

- 연속 공격
- 방어하기
- 그 외...

---

- 전부 다시 뽑기
- 한 번 더 교환
- 현재 나온 패의 추가 증가량 2배

# 어떤 식으로 플레이할 것인가

1. 플레이어가 강해지는 방식

- 포커를 사용


    1) 5장의 카드로 진행
    2) 각 카드마다 교환할 수 있는 chance 1 - 교환 방식은 random
    3) 카드 모양 별로 서열 정해서 추가 배율 시스템
       - ♠(1.5배) ♥(1.3배) ♣(1.1배) ◆(default=1.0)
    4) 족보 별로 증가량 설정

2. 어떤 식으로 진행이 될 것인가

- 스테이지 진행마다 5장의 카드로 포커 진행
- 게임을 시작했을 때, 포커 시작
- 포커를 진행하는 화면에는  
  ┌─10──┐ ┌──2 ─┐ ┌──3 ─┐ ┌──4 ─┐ ┌──5 ─┐
  │ │ │ ♣ │ │ ♣ │ │♣ ♣│ │♣ ♣│
  │ ♣ │ │ │ │ ♣ │ │ │ │ ♣ │
  │ │ │ ♣ │ │ ♣ │ │♣ ♣│ │♣ ♣│-- j1on?
  │ │ │ │ │ │ │ │ │ │-- ♣10?
  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
  ***
  ## 1 : 교환 2 : 교환 3 : 교환 4: 교환 5: 교환
  ## 1 : 교환 2 : -- 3 : 교환 4: 교환 5: -- // 교환 했으면 선택 불가
  6 : 완료 7 : 건너뛰기 100 : 족보 보기
- 포커를 완료했으면 띄우는 화면
