import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/auth';

const Dashboard: React.FC = () => {
  const { signOut } = useAuth();
  const history = useHistory();

  const handleLogout = useCallback(() => {
    signOut();
    history.push('/');
  }, [signOut, history]);

  return (
    <>
      <h1>Dashboard</h1>
      <Button type="button" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );
};

export default Dashboard;
