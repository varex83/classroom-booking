"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const AuthError = () => {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('error_description');

    const getErrorMessage = (error: string | null, description: string | null) => {
        // If we have a specific error description from the server, use it
        if (description) return description;

        // Otherwise, fall back to predefined messages
        switch (error) {
            case 'CredentialsSignin':
                return 'Invalid email or password';
            case 'AccessDenied':
                return 'You do not have permission to access this resource';
            case 'Verification':
                return 'The verification link is invalid or has expired';
            case 'EmailSignin':
                return 'The email link is invalid or has expired';
            case 'Configuration':
                return 'There is a problem with the server configuration';
            case 'OAuthSignin':
                return 'Error in the OAuth signin process';
            case 'OAuthCallback':
                return 'Error in the OAuth callback process';
            case 'OAuthCreateAccount':
                return 'Could not create OAuth provider account';
            case 'EmailCreateAccount':
                return 'Could not create email provider account';
            case 'Callback':
                return 'Error in the OAuth callback';
            case 'OAuthAccountNotLinked':
                return 'Email already exists with different provider';
            case 'SessionRequired':
                return 'Please sign in to access this page';
            default:
                return 'An unexpected authentication error occurred';
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
            <div className="card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
                    <p className="text-red-600 mt-2">
                        {getErrorMessage(error, errorMessage)}
                    </p>
                </div>
                <div className="flex justify-center space-x-4">
                    <Link 
                        href="/login" 
                        className="btn-primary"
                    >
                        Try Again
                    </Link>
                    <Link 
                        href="/" 
                        className="btn-secondary"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthError; 