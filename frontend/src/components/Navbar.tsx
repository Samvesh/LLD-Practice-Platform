import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { learner, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">LLD Practice</Link>
      <div className="navbar-user">
        <span>{learner?.name}</span>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
