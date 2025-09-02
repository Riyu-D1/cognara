import React from 'react';
import { useAuth } from './AuthProvider';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const AuthTest: React.FC = () => {
  const { user, session } = useAuth();

  const testServerConnection = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e4147917/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const result = await response.json();
      console.log('Server connection test:', result);
      alert(`Server status: ${result.status}`);
    } catch (error) {
      console.error('Server connection error:', error);
      alert('Server connection failed');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="text-lg font-medium mb-4">Authentication Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}
        </div>
        
        {user && (
          <>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Provider:</strong> {user.provider || 'email'}</div>
          </>
        )}
        
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        
        {session && (
          <div><strong>Access Token:</strong> {session.access_token ? 'Present' : 'Missing'}</div>
        )}
        
        <div className="pt-2">
          <button
            onClick={testServerConnection}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Test Server Connection
          </button>
        </div>
      </div>
    </div>
  );
};