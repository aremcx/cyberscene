import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../../db/store';
import { Badge, Button, EmptyState, Alert } from '../../components/ui';
import { Difficulty, LabType, QuizQuestionType } from '../../db/academySchema';
import type { Lab, LabQuestion } from '../../db/academySchema';
import { useAuth } from '../../components/auth/AuthProvider';

export function LabDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [lab, setLab] = useState<Lab | null>(null);
  const [questions, setQuestions] = useState<LabQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (slug) {
      const foundLab = db.getLabBySlug(slug);
      if (foundLab) {
        setLab(foundLab);
        const labQuestions = db.listLabQuestionsByLab(foundLab.id);
        setQuestions(labQuestions);
      }
    }
  }, [slug]);

  if (!lab) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="🔬"
          title="Lab not found"
          description="The lab you're looking for doesn't exist"
          action={
            <Link to="/academy/labs">
              <Button>Browse Labs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'success';
      case Difficulty.INTERMEDIATE:
        return 'info';
      case Difficulty.ADVANCED:
        return 'warning';
      case Difficulty.EXPERT:
        return 'danger';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: LabType) => {
    switch (type) {
      case LabType.HANDS_ON:
        return 'Hands-on Lab';
      case LabType.CTF:
        return 'Capture The Flag';
      case LabType.SCENARIO:
        return 'Scenario-based';
      default:
        return type;
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!user) return;

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });

    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    setScore(scorePercentage);
    setSubmitted(true);

    // Submit attempt
    const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    db.submitLabAttempt(
      user.id,
      lab.id,
      answers,
      scorePercentage,
      scorePercentage >= 70,
      timeSpent
    );

    // Award points
    if (scorePercentage >= 70) {
      db.updateUserPoints(user.id, earnedPoints);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
        <Link to="/academy" className="hover:text-emerald-400 transition-colors">
          Academy
        </Link>
        <span>/</span>
        <Link to="/academy/labs" className="hover:text-emerald-400 transition-colors">
          Labs
        </Link>
        <span>/</span>
        <span className="text-white">{lab.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-3">{lab.title}</h1>
            <div className="flex items-center gap-3">
              <Badge variant={getDifficultyColor(lab.difficulty)} size="md">
                {lab.difficulty}
              </Badge>
              <Badge variant="outline" size="md">
                {getTypeLabel(lab.type)}
              </Badge>
              <span className="text-gray-400">⏱️ {lab.estimatedTime} minutes</span>
              <span className="text-emerald-400 font-semibold">{lab.points} points</span>
            </div>
          </div>
        </div>
        <p className="text-lg text-gray-300 mb-6">{lab.description}</p>

        {/* Objectives */}
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Learning Objectives</h2>
          <ul className="space-y-2">
            {lab.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{lab.instructions}</p>
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-white">Questions</h2>
          {questions.map((question, idx) => (
            <div key={question.id} className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Question {idx + 1}
                </h3>
                <Badge variant="outline" size="sm">
                  {question.points} points
                </Badge>
              </div>
              <p className="text-gray-300 mb-4">{question.question}</p>

              {question.type === QuizQuestionType.MULTIPLE_CHOICE && (
                <div className="space-y-2">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-emerald-500/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={submitted}
                        className="w-4 h-4 text-emerald-500"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === QuizQuestionType.TRUE_FALSE && (
                <div className="space-y-2">
                  {question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-emerald-500/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={submitted}
                        className="w-4 h-4 text-emerald-500"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === QuizQuestionType.SHORT_ANSWER && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              )}

              {submitted && (
                <div className="mt-4">
                  <Alert
                    variant={answers[question.id] === question.correctAnswer ? 'success' : 'error'}
                    title={answers[question.id] === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                  >
                    {answers[question.id] !== question.correctAnswer && question.hint && (
                      <p className="text-sm"><strong>Hint:</strong> {question.hint}</p>
                    )}
                    <p className="text-sm mt-1">
                      <strong>Correct answer:</strong> {question.correctAnswer}
                    </p>
                  </Alert>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {!submitted && questions.length > 0 && (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleSubmit} disabled={!user}>
            Submit Answers
          </Button>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
          <h2 className="text-2xl font-bold text-white mb-4">Lab Complete!</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {Math.round(score)}%
              </div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {score >= 70 ? lab.points : 0}
              </div>
              <div className="text-sm text-gray-400">Points Earned</div>
            </div>
          </div>
          {score >= 70 ? (
            <Alert variant="success" title="Congratulations!">
              <p>You passed the lab and earned {lab.points} points!</p>
            </Alert>
          ) : (
            <Alert variant="warning" title="Keep Practicing">
              <p>You need 70% to pass. Review the material and try again.</p>
            </Alert>
          )}
        </div>
      )}

      {!user && (
        <Alert variant="info" title="Sign in required">
          <p>Please sign in to submit your lab answers and earn points.</p>
        </Alert>
      )}
    </div>
  );
}
