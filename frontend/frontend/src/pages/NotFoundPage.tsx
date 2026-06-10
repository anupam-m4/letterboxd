import { useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { ROUTES } from '../constants/routes';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-c-bg">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="text-c-border text-9xl font-bold mb-2 select-none">404</div>
        <h1 className="text-c-text text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-c-text3 text-sm mb-8 max-w-sm">
          This page has gone dark — like a film that never got a theatrical release.
        </p>
        <button
          onClick={() => navigate(ROUTES.HOME)}
          style={{ backgroundColor: 'var(--c-green)', color: '#000000' }}
          className="font-semibold px-6 py-2 rounded"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
