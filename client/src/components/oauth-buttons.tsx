import React from 'react';
import { Button } from './ui/button';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface OAuthButtonProps {
  provider: 'google' | 'facebook';
  className?: string;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, className = '' }) => {
  const handleOAuthLogin = () => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <Button
      type="button"
      variant={provider === 'google' ? 'outline' : 'default'}
      className={`w-full ${className}`}
      onClick={handleOAuthLogin}
    >
      {provider === 'google' ? (
        <>
          <FaGoogle className="mr-2 h-4 w-4" />
          Sign in with Google
        </>
      ) : (
        <>
          <FaFacebook className="mr-2 h-4 w-4" />
          Sign in with Facebook
        </>
      )}
    </Button>
  );
};

export const OAuthDivider: React.FC = () => {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-2 text-gray-500">Or continue with</span>
      </div>
    </div>
  );
};