// 볼링 점수 계산 유틸리티

export interface FrameInput {
  firstRoll: number | null;   // 0-10, null = 미입력
  secondRoll: number | null;  // 0-10, null = 미입력
  thirdRoll: number | null;   // 10프레임만, null = 미입력
}

export interface FrameResult {
  frameNumber: number;
  firstRoll: string | null;   // "X", "7", "-", etc.
  secondRoll: string | null;  // "/", "3", null, etc.
  thirdRoll: string | null;   // 10프레임만
  frameScore: number | null;
  runningTotal: number | null;
  frameType: 'NORMAL' | 'SPARE' | 'STRIKE';
}

// 숫자 → 볼링 표기법 변환
export function rollToDisplay(pins: number | null, isSecondRoll = false, firstRollPins = 0): string {
  if (pins === null) return '';
  if (pins === 0) return '-';
  if (pins === 10 && !isSecondRoll) return 'X';
  if (isSecondRoll && firstRollPins + pins === 10) return '/';
  if (pins === 10 && isSecondRoll) return 'X';
  return pins.toString();
}

// 10프레임 3투 표기 변환
export function thirdRollToDisplay(pins: number | null, secondRollPins: number | null, isAfterSpare: boolean): string {
  if (pins === null) return '';
  if (pins === 0) return '-';
  if (pins === 10) return 'X';
  if (isAfterSpare && secondRollPins !== null && secondRollPins + pins === 10) return '/';
  return pins.toString();
}

// 2투 시 선택 가능한 핀 수 반환
export function getAvailablePinsForSecondRoll(firstRollPins: number): number[] {
  const max = 10 - firstRollPins;
  return Array.from({ length: max + 1 }, (_, i) => i);
}

// 10프레임 3투 시 선택 가능한 핀 수 반환
export function getAvailablePinsForTenthFrame(
  roll: 'second' | 'third',
  firstRoll: number | null,
  secondRoll: number | null
): number[] {
  if (roll === 'second') {
    if (firstRoll === 10) {
      // 1투 스트라이크 → 2투는 0~10
      return Array.from({ length: 11 }, (_, i) => i);
    }
    // 일반 → 남은 핀
    return Array.from({ length: 10 - (firstRoll ?? 0) + 1 }, (_, i) => i);
  }

  // 3투
  if (firstRoll === 10 && secondRoll === 10) {
    // 더블 스트라이크 → 3투 0~10
    return Array.from({ length: 11 }, (_, i) => i);
  }
  if (firstRoll === 10 && secondRoll !== null && secondRoll < 10) {
    // 스트라이크 + 일반 → 남은 핀
    return Array.from({ length: 10 - secondRoll + 1 }, (_, i) => i);
  }
  if (firstRoll !== null && secondRoll !== null && firstRoll + secondRoll === 10) {
    // 스페어 → 3투 0~10
    return Array.from({ length: 11 }, (_, i) => i);
  }

  return [];
}

// 10프레임에서 3투가 필요한지 확인
export function needsThirdRoll(firstRoll: number | null, secondRoll: number | null): boolean {
  if (firstRoll === null || secondRoll === null) return false;
  // 스트라이크 또는 스페어
  return firstRoll === 10 || firstRoll + secondRoll === 10;
}

// 프레임이 완료되었는지 확인
export function isFrameComplete(frameNumber: number, frame: FrameInput): boolean {
  if (frameNumber < 10) {
    // 스트라이크면 완료
    if (frame.firstRoll === 10) return true;
    // 1투, 2투 모두 입력되면 완료
    return frame.firstRoll !== null && frame.secondRoll !== null;
  }

  // 10프레임
  if (frame.firstRoll === null) return false;
  if (frame.secondRoll === null) return false;

  // 스트라이크 또는 스페어면 3투 필요
  if (needsThirdRoll(frame.firstRoll, frame.secondRoll)) {
    return frame.thirdRoll !== null;
  }

  return true;
}

// 모든 투구를 flat 배열로 변환 (점수 계산용)
function flattenRolls(frames: FrameInput[]): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (frame.firstRoll !== null) rolls.push(frame.firstRoll);
    if (i < 9) {
      // 1~9프레임: 스트라이크가 아니면 2투 추가
      if (frame.firstRoll !== 10 && frame.secondRoll !== null) {
        rolls.push(frame.secondRoll);
      }
    } else {
      // 10프레임: 모든 투구 추가
      if (frame.secondRoll !== null) rolls.push(frame.secondRoll);
      if (frame.thirdRoll !== null) rolls.push(frame.thirdRoll);
    }
  }
  return rolls;
}

// 전체 점수 계산
export function calculateScores(frames: FrameInput[]): FrameResult[] {
  const rolls = flattenRolls(frames);
  const results: FrameResult[] = [];
  let rollIndex = 0;
  let runningTotal = 0;

  for (let frameNum = 0; frameNum < 10; frameNum++) {
    const frame = frames[frameNum];
    if (!frame || frame.firstRoll === null) {
      results.push({
        frameNumber: frameNum + 1,
        firstRoll: null,
        secondRoll: null,
        thirdRoll: null,
        frameScore: null,
        runningTotal: null,
        frameType: 'NORMAL',
      });
      break;
    }

    if (frameNum < 9) {
      // 1~9프레임
      if (frame.firstRoll === 10) {
        // 스트라이크
        const bonus1 = rolls[rollIndex + 1] ?? null;
        const bonus2 = rolls[rollIndex + 2] ?? null;
        const frameScore = (bonus1 !== null && bonus2 !== null)
          ? 10 + bonus1 + bonus2
          : null;

        if (frameScore !== null) runningTotal += frameScore;

        results.push({
          frameNumber: frameNum + 1,
          firstRoll: 'X',
          secondRoll: null,
          thirdRoll: null,
          frameScore,
          runningTotal: frameScore !== null ? runningTotal : null,
          frameType: 'STRIKE',
        });
        rollIndex += 1;
      } else if (frame.secondRoll !== null && frame.firstRoll + frame.secondRoll === 10) {
        // 스페어
        const bonus = rolls[rollIndex + 2] ?? null;
        const frameScore = bonus !== null ? 10 + bonus : null;

        if (frameScore !== null) runningTotal += frameScore;

        results.push({
          frameNumber: frameNum + 1,
          firstRoll: frame.firstRoll === 0 ? '-' : frame.firstRoll.toString(),
          secondRoll: '/',
          thirdRoll: null,
          frameScore,
          runningTotal: frameScore !== null ? runningTotal : null,
          frameType: 'SPARE',
        });
        rollIndex += 2;
      } else if (frame.secondRoll !== null) {
        // 일반
        const frameScore = frame.firstRoll + frame.secondRoll;
        runningTotal += frameScore;

        results.push({
          frameNumber: frameNum + 1,
          firstRoll: frame.firstRoll === 0 ? '-' : frame.firstRoll.toString(),
          secondRoll: frame.secondRoll === 0 ? '-' : frame.secondRoll.toString(),
          thirdRoll: null,
          frameScore,
          runningTotal,
          frameType: 'NORMAL',
        });
        rollIndex += 2;
      } else {
        // 1투만 입력됨
        results.push({
          frameNumber: frameNum + 1,
          firstRoll: frame.firstRoll === 0 ? '-' : frame.firstRoll.toString(),
          secondRoll: null,
          thirdRoll: null,
          frameScore: null,
          runningTotal: null,
          frameType: 'NORMAL',
        });
        break;
      }
    } else {
      // 10프레임
      let frameScore: number | null = null;
      let frameType: 'NORMAL' | 'SPARE' | 'STRIKE' = 'NORMAL';

      const f = frame.firstRoll;
      const s = frame.secondRoll;
      const t = frame.thirdRoll;

      if (f === 10) frameType = 'STRIKE';
      else if (s !== null && f + s === 10) frameType = 'SPARE';

      if (isFrameComplete(10, frame)) {
        frameScore = f + (s ?? 0) + (t ?? 0);
        runningTotal += frameScore;
      }

      const firstDisplay = f === 0 ? '-' : f === 10 ? 'X' : f.toString();
      let secondDisplay: string | null = null;
      if (s !== null) {
        if (f === 10) {
          secondDisplay = s === 10 ? 'X' : s === 0 ? '-' : s.toString();
        } else {
          secondDisplay = f + s === 10 ? '/' : s === 0 ? '-' : s.toString();
        }
      }
      let thirdDisplay: string | null = null;
      if (t !== null) {
        if (s === 10 || (f === 10 && s !== null && s < 10 && s + t === 10)) {
          // 2투가 스트라이크이거나, 2투+3투가 스페어
          thirdDisplay = (f === 10 && s !== null && s < 10 && s + t === 10) ? '/' : t === 10 ? 'X' : t === 0 ? '-' : t.toString();
        } else if (f !== 10 && s !== null && f + s === 10) {
          // 스페어 후 3투
          thirdDisplay = t === 10 ? 'X' : t === 0 ? '-' : t.toString();
        } else {
          thirdDisplay = t === 10 ? 'X' : t === 0 ? '-' : t.toString();
        }
      }

      results.push({
        frameNumber: 10,
        firstRoll: firstDisplay,
        secondRoll: secondDisplay,
        thirdRoll: thirdDisplay,
        frameScore: isFrameComplete(10, frame) ? frameScore : null,
        runningTotal: isFrameComplete(10, frame) ? runningTotal : null,
        frameType,
      });
    }
  }

  // 남은 프레임 채우기
  while (results.length < 10) {
    results.push({
      frameNumber: results.length + 1,
      firstRoll: null,
      secondRoll: null,
      thirdRoll: null,
      frameScore: null,
      runningTotal: null,
      frameType: 'NORMAL',
    });
  }

  return results;
}

// 총점 계산
export function getTotalScore(frames: FrameInput[]): number | null {
  const results = calculateScores(frames);
  const lastCompleteFrame = [...results].reverse().find(r => r.runningTotal !== null);
  return lastCompleteFrame?.runningTotal ?? null;
}

// 게임이 완료되었는지 확인
export function isGameComplete(frames: FrameInput[]): boolean {
  if (frames.length !== 10) return false;
  return frames.every((frame, i) => isFrameComplete(i + 1, frame));
}

// 현재 입력해야 할 프레임/투구 반환
export function getCurrentInput(frames: FrameInput[]): { frameIndex: number; roll: 'first' | 'second' | 'third' } | null {
  for (let i = 0; i < 10; i++) {
    const frame = frames[i];
    if (frame.firstRoll === null) {
      return { frameIndex: i, roll: 'first' };
    }

    if (i < 9) {
      if (frame.firstRoll === 10) continue; // 스트라이크 → 다음 프레임
      if (frame.secondRoll === null) {
        return { frameIndex: i, roll: 'second' };
      }
    } else {
      // 10프레임
      if (frame.secondRoll === null) {
        return { frameIndex: i, roll: 'second' };
      }
      if (needsThirdRoll(frame.firstRoll, frame.secondRoll) && frame.thirdRoll === null) {
        return { frameIndex: i, roll: 'third' };
      }
    }
  }
  return null; // 게임 완료
}

// 빈 프레임 배열 생성
export function createEmptyFrames(): FrameInput[] {
  return Array.from({ length: 10 }, () => ({
    firstRoll: null,
    secondRoll: null,
    thirdRoll: null,
  }));
}
