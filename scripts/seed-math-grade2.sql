-- One-off content seed: "Ôn tập Toán lớp 2 – Đề 1", 20 questions ordered easy → hard.
-- Difficulty is carried by quiz points: 10 dễ–vừa (1đ), 8 vừa–khó (2đ), 2 rất khó (3đ).
-- Owner = the oldest super_admin. Re-running is a no-op (skips when the quiz title exists).
-- Usage: psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/seed-math-grade2.sql
do $$
declare
  v_owner uuid;
  v_subject uuid;
  v_grade uuid;
  v_quiz uuid;
  v_qid uuid;
  v_topic uuid;
  q record;
begin
  if exists (select 1 from public.quizzes where title = 'Ôn tập Toán lớp 2 – Đề 1') then
    raise notice 'Quiz already seeded, skipping';
    return;
  end if;

  select id into strict v_owner from public.profiles where role_id = 'super_admin' order by created_at limit 1;
  select id into strict v_subject from public.subjects where name = 'Toán';
  select id into strict v_grade from public.grades where name = 'Lớp 2';

  insert into public.topics (subject_id, grade_id, name)
  values (v_subject, v_grade, 'Số và phép tính'), (v_subject, v_grade, 'Đo lường'), (v_subject, v_grade, 'Giải toán có lời văn')
  on conflict (subject_id, grade_id, name) do nothing;

  insert into public.quizzes (title, subject_id, grade_id, created_by)
  values ('Ôn tập Toán lớp 2 – Đề 1', v_subject, v_grade, v_owner)
  returning id into v_quiz;

  for q in
    select * from (values
      -- ── Dễ – vừa (1 điểm) ──
      (1, 1, 'Số và phép tính', 'mcq', 'Số 305 đọc là:',
        '{"options":["Ba trăm năm","Ba trăm linh năm","Ba mươi lăm","Ba trăm năm mươi"],"multiple":false}', '{"correct":[1]}'),
      (2, 1, 'Số và phép tính', 'number', 'Tính: 46 + 27 = ?', '{}', '{"value":73,"tolerance":0}'),
      (3, 1, 'Số và phép tính', 'number', 'Tính: 82 − 35 = ?', '{}', '{"value":47,"tolerance":0}'),
      (4, 1, 'Số và phép tính', 'number', 'Tính: 5 × 6 = ?', '{}', '{"value":30,"tolerance":0}'),
      (5, 1, 'Số và phép tính', 'number', 'Tính: 18 : 2 = ?', '{}', '{"value":9,"tolerance":0}'),
      (6, 1, 'Số và phép tính', 'fill', 'Điền số thích hợp vào chỗ trống.',
        '{"text":"Số liền sau của 499 là [[]]."}', '{"blanks":[["500"]]}'),
      (7, 1, 'Đo lường', 'mcq', '1 m bằng bao nhiêu xăng-ti-mét?',
        '{"options":["10 cm","100 cm","1000 cm","50 cm"],"multiple":false}', '{"correct":[1]}'),
      -- items are shown in this order; answer.order lists item indices smallest → largest: 213, 231, 312, 321
      (8, 1, 'Số và phép tính', 'order', 'Sắp xếp các số theo thứ tự từ bé đến lớn.',
        '{"items":["312","231","321","213"]}', '{"order":[3,1,0,2]}'),
      (9, 1, 'Đo lường', 'mcq', 'Bây giờ là 3 giờ chiều. Sau 2 giờ nữa là mấy giờ?',
        '{"options":["1 giờ chiều","4 giờ chiều","5 giờ chiều","6 giờ chiều"],"multiple":false}', '{"correct":[2]}'),
      -- pairs[left] = right index: 2×4→8, 5×3→15, 2×9→18, 5×5→25
      (10, 1, 'Số và phép tính', 'match', 'Nối phép tính với kết quả đúng.',
        '{"left":["2 × 4","5 × 3","2 × 9","5 × 5"],"right":["15","25","8","18"]}', '{"pairs":[2,0,3,1]}'),
      -- ── Vừa – khó (2 điểm) ──
      (11, 2, 'Số và phép tính', 'number', 'Đặt tính rồi tính: 356 + 427 = ?', '{}', '{"value":783,"tolerance":0}'),
      (12, 2, 'Số và phép tính', 'number', 'Đặt tính rồi tính: 704 − 258 = ?', '{}', '{"value":446,"tolerance":0}'),
      (13, 2, 'Giải toán có lời văn', 'number',
        'Lớp 2A có 35 học sinh. Lớp 2B ít hơn lớp 2A 7 học sinh. Hỏi lớp 2B có bao nhiêu học sinh?',
        '{"unit":"học sinh"}', '{"value":28,"tolerance":0}'),
      (14, 2, 'Giải toán có lời văn', 'number', 'Mỗi con gà có 2 chân. Hỏi 8 con gà có tất cả bao nhiêu chân?',
        '{"unit":"chân"}', '{"value":16,"tolerance":0}'),
      (15, 2, 'Giải toán có lời văn', 'number', 'Có 40 cái kẹo chia đều cho 5 bạn. Hỏi mỗi bạn được mấy cái kẹo?',
        '{"unit":"cái kẹo"}', '{"value":8,"tolerance":0}'),
      (16, 2, 'Đo lường', 'fill', 'Điền số thích hợp vào chỗ trống.',
        '{"text":"6 dm 4 cm = [[]] cm"}', '{"blanks":[["64"]]}'),
      (17, 2, 'Đo lường', 'mcq', 'Hôm nay là thứ Hai, ngày 10. Hỏi thứ Hai tuần sau là ngày bao nhiêu?',
        '{"options":["Ngày 11","Ngày 16","Ngày 17","Ngày 18"],"multiple":false}', '{"correct":[2]}'),
      (18, 2, 'Số và phép tính', 'fill', 'Tìm số thích hợp điền vào chỗ trống.',
        '{"text":"[[]] + 28 = 65"}', '{"blanks":[["37"]]}'),
      -- ── Rất khó – tư duy (3 điểm) ──
      (19, 3, 'Giải toán có lời văn', 'number',
        'Năm nay bố hơn con 28 tuổi. Hỏi 5 năm nữa bố hơn con bao nhiêu tuổi?',
        '{"unit":"tuổi"}', '{"value":28,"tolerance":0}'),
      (20, 3, 'Giải toán có lời văn', 'number',
        'Trong sân có gà và chó, đếm được tất cả 5 con và 14 cái chân. Hỏi trong sân có bao nhiêu con chó?',
        '{"unit":"con chó"}', '{"value":2,"tolerance":0}')
    ) as t(pos, points, topic, type, prompt, content, answer)
  loop
    select id into strict v_topic from public.topics
      where subject_id = v_subject and grade_id = v_grade and name = q.topic;
    insert into public.questions (type, subject_id, grade_id, topic_id, prompt, content, answer, created_by)
    values (q.type, v_subject, v_grade, v_topic, q.prompt, q.content::jsonb, q.answer::jsonb, v_owner)
    returning id into v_qid;
    insert into public.quiz_questions (quiz_id, question_id, position, points)
    values (v_quiz, v_qid, q.pos - 1, q.points); -- positions are 0-based, like the quiz editor writes them
  end loop;
end $$;
