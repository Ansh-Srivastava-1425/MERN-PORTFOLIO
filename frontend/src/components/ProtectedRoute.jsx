import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchMe } from '../redux/slices/authSlice';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // If user is not set and we haven't loaded yet, try to fetch current session
  useEffect(() => {
    if (!isAuthenticated && !user && !loading) {
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated, user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex flex-col justify-center items-center font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 border-4 border-cyan-500/20 border-b-cyan-500 rounded-full animate-spin [animation-direction:reverse]"></div>
        </div>
        <p className="mt-6 text-sm text-slate-400 font-mono tracking-widest animate-pulse">
          AUTHENTICATING SESSION...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
