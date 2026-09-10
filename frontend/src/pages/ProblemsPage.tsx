import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  requirements: string[];
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/problems')
      .then(res => setProblems(res.data.problems))
      .catch(err => console.error('Failed to load problems:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading problems...</div>;
  }

  return (
    <div className="container page">
      <h1 className="mb-lg">LLD Practice Problems</h1>
      <p className="text-secondary mb-lg">
        Choose a problem, design a solution, submit, and get structured AI feedback.
      </p>
      <div className="card-grid">
        {problems.map(problem => (
          <Link key={problem.id} to={`/problems/${problem.id}`} style={{ textDecoration: 'none' }}>
            <div className="card">
              <div className="flex-between mb-md">
                <h3>{problem.title}</h3>
                <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
              </div>
              <p className="text-secondary text-sm">{problem.description.slice(0, 120)}...</p>
              <p className="text-muted text-xs mt-md">{problem.requirements.length} requirements</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
