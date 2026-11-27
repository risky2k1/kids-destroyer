const SHAPES: Record<string, string> = {
  mcq: 'content {"options":["2","4"],"multiple":false} answer {"correct":[1]}. correct là chỉ số phương án, bắt đầu từ 0.',
  fill: 'content {"text":"2 + 2 = [[]]"} answer {"blanks":[["4"]]}. Mỗi chỗ trống là [[]] và một mảng đáp án chấp nhận.',
  number: 'content {"unit":""} answer {"value":4,"tolerance":0}.',
  order:
    'content {"items":["1","3","2"]} answer {"order":[0,2,1]}. order là hoán vị đúng của chỉ số items.',
  match:
    'content {"left":["2+2","3+3"],"right":["6","4"]} answer {"pairs":[1,0]}. pairs[i] là chỉ số vế phải đúng của vế trái i.',
};

const responseSchema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING' },
          prompt: { type: 'STRING' },
          content: { type: 'STRING' },
          answer: { type: 'STRING' },
        },
        required: ['type', 'prompt', 'content', 'answer'],
      },
    },
  },
  required: ['title', 'items'],
};

export function buildPrompt(input: {
  subjectName: string;
  gradeName: string;
  topicName: string | null;
  count: number;
  types: string[];
  lang: string;
  note: string;
}): { text: string; responseSchema: object } {
  const shapes = input.types.map((type) => `${type}: ${SHAPES[type] ?? ''}`).join('\n');
  const topic = input.topicName ? ` Chủ đề: ${input.topicName}.` : '';
  const note = input.note.trim() ? ` Ghi chú: ${input.note.trim()}.` : '';
  const text = [
    `Soạn ${input.count} câu ${input.lang === 'en' ? 'tiếng Anh' : 'tiếng Việt'} cho ${input.gradeName}, môn ${input.subjectName}.${topic}${note}`,
    'Nội dung hợp lứa tuổi. Không nhắc tên bé hay gia đình.',
    'content và answer là chuỗi JSON đúng dạng sau:',
    shapes,
    'Chỉ dùng các dạng đã nêu.',
  ].join('\n');
  return { text, responseSchema };
}
