import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const withAuth = (WrappedComponent, allowedRoles) => {
    return (props) => {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'loading') return; // Do nothing while loading
            if (!session || !allowedRoles.includes(session.user.role)) {
                router.push('/'); // Redirect to home if not authorized
            }
        }, [session, status]);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth; 