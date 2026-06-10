import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SearchPage from '../pages/SearchPage';
import MovieDetailPage from '../pages/MovieDetailPage';
import ProfilePage from '../pages/ProfilePage';
import WatchlistPage from '../pages/WatchlistPage';
import WatchedPage from '../pages/WatchedPage';
import FeedPage from '../pages/FeedPage';
import UserSearchPage from '../pages/UserSearchPage';
import NotFoundPage from '../pages/NotFoundPage';
import { Spin } from 'antd';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#14181c]">
        <Spin size="large" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<SearchPage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.MOVIE_DETAIL} element={<MovieDetailPage />} />
        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path={ROUTES.WATCHLIST} element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
        <Route path={ROUTES.WATCHED} element={<ProtectedRoute><WatchedPage /></ProtectedRoute>} />
        <Route path={ROUTES.FEED} element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
        <Route path={ROUTES.USER_SEARCH} element={<UserSearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
