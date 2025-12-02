
export enum SimulationStep {
  INTRO = 'INTRO',
  INSPECT = 'INSPECT', // 检查压力
  PULL = 'PULL',       // 拔掉插销
  AIM = 'AIM',         // 瞄准
  SQUEEZE = 'SQUEEZE', // 按压
  SWEEP = 'SWEEP',     // 扫射
  SUCCESS = 'SUCCESS', // 成功
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Point {
  x: number;
  y: number;
}
