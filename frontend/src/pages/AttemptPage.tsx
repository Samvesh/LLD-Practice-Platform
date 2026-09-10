import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/client';

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [designText, setDesignText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate idempotency key once on mount — prevents duplicate submissions on double-click
  const idempotencyKeyRef = useRef(uuidv4());

  useEffect(() => {
    api.get(`/attempts/${id}`)
      .then(res => {
        setAttempt(res.data.attempt);
        if (res.data.submission) {
          setExistingSubmission(res.data.submission);
        }
      })
      .catch(err => console.error('Failed to load attempt:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!designText.trim()) {
      setError('Please write your design solution before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/submissions', {
        attemptId: id,
        content: { format: 'text', body: designText },
        idempotencyKey: idempotencyKeyRef.current,
      });

      // Navigate to submission status page
      navigate(`/submissions/${res.data.submission.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
      // Generate a new idempotency key for the next attempt
      idempotencyKeyRef.current = uuidv4();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading attempt...</div>;
  }

  // If a submission already exists, redirect to it
  if (existingSubmission) {
    return (
      <div className="container page">
        <div className="card">
          <h2 className="mb-md">Submission Already Exists</h2>
          <p className="text-secondary mb-md">
            This attempt already has a submission.
          </p>
          <Link to={`/submissions/${existingSubmission.id}`} className="btn btn-primary">
            View Submission
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <Link
        to={attempt ? `/problems/${attempt.problemId}` : '/'}
        className="text-secondary text-sm"
        style={{ textDecoration: 'none' }}
      >
        ← Back to problem
      </Link>

      <h1 className="mt-md mb-md">Write Your Design — Attempt #{attempt?.attemptNumber}</h1>
      <p className="text-secondary mb-lg">
        Describe your low-level design: classes, responsibilities, relationships, patterns used, and trade-offs.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="design-input">Design Solution</label>
        <textarea
          id="design-input"
          className="form-input"
          value={designText}
          onChange={(e) => setDesignText(e.target.value)}
          placeholder={`Describe your design here...\n\nSuggested structure:\n1. Key Classes & Responsibilities\n2. Relationships & Interfaces\n3. Design Patterns Used\n4. Edge Cases Considered\n5. Extensibility & Trade-offs`}
          disabled={submitting}
        />
      </div>

      <div className="flex-between">
        <span className="text-xs text-muted">{designText.length} characters</span>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || !designText.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit for Evaluation'}
        </button>
      </div>
    </div>
  );
}
