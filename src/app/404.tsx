import Link from 'next/link';

const Custom404 = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
            <div className="card text-center max-w-lg mx-auto">
                <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <Link href="/" className="btn-primary">
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default Custom404; 