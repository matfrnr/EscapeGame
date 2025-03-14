
const LoginPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#292929] text-white text-center px-6">
            <h1 className="text-3xl font-bold mb-6 text-primary">Il faut sauver le<br /> BDE MMI</h1>

            {/* Image */}
            <img src="/path/to/mascot-image.png" alt="Mascot" className="w-24 h-24 mb-8" />

            {/* Username Input */}
            <input
                type="text"
                placeholder="Username"
                className="w-full max-w-xs p-2 mb-4 border-b border-gray-400 bg-transparent text-white text-center placeholder-gray-400 focus:outline-none"
            />

            {/* Password Input */}
            <input
                type="password"
                placeholder="Password"
                className="w-full max-w-xs p-2 mb-4 border-b border-gray-400 bg-transparent text-white text-center placeholder-gray-400 focus:outline-none"
            />

            {/* Login Button */}
            <button className="w-full max-w-xs bg-[#d38a5c] text-black font-bold py-2 rounded mb-4 transition-transform transform hover:scale-105">
                Connexion
            </button>

            {/* Signup Button */}
            <button className="w-full max-w-xs border border-[#d38a5c] text-[#d38a5c] font-bold py-2 rounded transition-transform transform hover:scale-105">
                Inscription
            </button>
        </div>
    );
};

export default LoginPage;