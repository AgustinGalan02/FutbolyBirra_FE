function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-[#f0ac00]/20 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-t-[#f0ac00] border-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
        </div>
    );
}

export default LoadingSpinner;