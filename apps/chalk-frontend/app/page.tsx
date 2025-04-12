import Navbar from "./components/navbar";
import FeatureCard from "./components/featureCard";
import Link from "next/link";
const Page = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent">
            Draw, Collaborate, Create
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A beautiful and intuitive whiteboard for teams. Sketch ideas, create
            diagrams, and collaborate in real-time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-gray-200 text-[#1A1F2C] rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-gray-500 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="✨"
            title="Intuitive Drawing"
            description="Simple yet powerful tools for sketching and diagramming."
          />
          <FeatureCard
            icon="👥"
            title="Real-time Collaboration"
            description="Work together with your team in real-time, from anywhere."
          />
          <FeatureCard
            icon="🔄"
            title="Version History"
            description="Track changes and revert to previous versions anytime."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Chalk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
