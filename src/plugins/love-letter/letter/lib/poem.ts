export type Screen = {
  lines: string[];
  kind: 'envelope' | 'verse' | 'question' | 'yes';
  slow?: boolean;
};

export const SCREENS: Screen[] = [
  { kind: 'envelope', lines: ['A letter, just for you,', 'Tap to open. Let me tell you.'] },
  {
    kind: 'verse',
    lines: [
      'Chuyện mình có tự những ngày',
      'Cấp hai năm ấy, mây bay xa vời.',
      'Năm quên tháng đợi ngày trôi…',
    ],
  },
  {
    kind: 'verse',
    lines: [
      'Cấp ba, mỗi đứa một nơi xa dần.',
      'Tuy chung một nhóm bao lần,',
      'Mà sao chưa thể lại gần bên nhau.',
    ],
  },
  {
    kind: 'verse',
    slow: true,
    lines: ['Thời gian lặng lẽ qua mau,', 'Bẵng đi năm tháng, ai đâu ngờ là…'],
  },
  { kind: 'verse', lines: ['Hôm nao tiệc cưới người ta,', 'Hóa ra đi một vòng xa lại về.'] },
  {
    kind: 'verse',
    lines: [
      'Lần này tớ nói, cậu nghe,',
      'Chẳng còn trêu chọc như hè năm xưa.',
      'Bao ngày trò chuyện, gió mưa,',
      'Tớ mong bên cạnh, hứa thưa với nàng.',
    ],
  },
  {
    kind: 'question',
    lines: ['Hôm nay tớ hỏi rõ ràng:', 'Làm người yêu tớ, cậu bằng lòng không?'],
  },
  {
    kind: 'yes',
    lines: ['Vậy là tớ hết ngóng trông,', 'Ngẩng lên nhìn tớ, cười cùng nhau nha'],
  },
];

export const YES_LABEL = 'Bằng lòng';
export const NO_LABEL = 'Không bằng lòng';
