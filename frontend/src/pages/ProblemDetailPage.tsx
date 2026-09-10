import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { sanitizeText } from '../utils/sanitize';

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  difficulty: string;
  hints: string[];
}

interface Attempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
  submission?: {
    id: string;
    state: string;
    evaluationResult?: {
      overallScore: number;
    };
  };
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/problems/${id}`),
      api.get(`/attempts/problem/${id}`),
    ])
      .then(([problemRes, attemptsRes]) => {
        setProblem(problemRes.data.problem);
        setAttempts(attemptsRes.data.attempts);
      })
      .catch(err => console.error('Failed to load:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const startAttempt = async () => {
    setStarting(true);
    try {
      const res = await api.post('/attempts', { problemId: id });
      navigate(`/attempts/${res.data.attempt.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start attempt.');
    } finally {
      setStarting(false);
    }
  };

  if (loading || !problem) {
    return <div className="loading"><div className="spinner"></div>Loading problem...</div>;
  }

  return (
    <div className="container page">
      <Link to="/" className="text-secondary text-sm" style={{ textDecoration: 'none' }}>← Back to problems</Link>

      <div className="flex-between mt-md mb-lg">
        <h1>{sanitizeText(problem.title)}</h1>
        <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
      </div>

      <div className="card mb-lg">
        <p className="mb-md">{sanitizeText(problem.description)}</p>
        <h3 className="mb-md">Requirements</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {problem.requirements.map((req, i) => (
            <li key={i} className="text-sm mb-md" style={{ color: 'var(--color-text-secondary)' }}>
              {sanitizeText(req)}
            </li>
          ))}
        </ul>
        {problem.hints.length > 0 && (
          <>
            <h3 className="mt-lg mb-md">Hints</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {problem.hints.map((hint, i) => (
                <li key={i} className="text-sm mb-md text-muted">{sanitizeText(hint)}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <button className="btn btn-primary" onClick={startAttempt} disabled={starting}>
        {starting ? 'Starting...' : 'Start New Attempt'}
      </button>

      {attempts.length > 0 && (
        <div className="mt-lg">
          <h2 className="mb-md">Your Attempts ({attempts.length})</h2>
          <div className="timeline">
            {attempts.map(attempt => (
              <Link
                key={attempt.id}
                to={attempt.submission ? `/submissions/${attempt.submission.id}` : `/attempts/${attempt.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div className="timeline-item">
                  <div className="timeline-number">{attempt.attemptNumber}</div>
                  <div className="timeline-content">
                    <div className="flex-between">
                      <span className="text-sm">Attempt #{attempt.attemptNumber}</span>
                      {attempt.submission && (
                        <span className={`badge badge-${attempt.submission.state.toLowerCase()}`}>
                          {attempt.submission.state}
                        </span>
                      )}
                      {!attempt.submission && (
                        <span className="badge badge-submitted">In Progress</span>
                      )}
                    </div>
                    <div className="text-xs text-muted mt-sm">
                      Started {new Date(attempt.startedAt).toLocaleString()}
                      {attempt.submission?.evaluationResult && (
                        <span> · Score: {attempt.submission.evaluationResult.overallScore}/10</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
