import { notFound } from 'next/navigation';
import { KidPlayer } from './components/KidPlayer';
import { KidResult } from './components/KidResult';
import { getKidAssignment } from './kidQueries';

export async function KidAssignmentView({ id }: { id: string }) {
  const assignment = await getKidAssignment(id);
  if (!assignment) notFound();

  if (assignment.step === 'play1' || assignment.step === 'play2') {
    return (
      <KidPlayer
        // round 2 has a different question list: remount so index/answers reset
        key={assignment.step}
        assignmentId={assignment.id}
        quizTitle={assignment.quizTitle}
        round={assignment.step === 'play1' ? 1 : 2}
        questions={assignment.questions}
      />
    );
  }

  return (
    <KidResult
      quizTitle={assignment.quizTitle}
      score={assignment.score}
      results={assignment.results}
      questions={assignment.questions}
      comment={assignment.comment}
      reveal={assignment.reveal}
    />
  );
}
