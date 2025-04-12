function Footer() {
  return (
    <footer className="relative overflow-visible rounded-xl border border-blue-500/20 mt-8">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 backdrop-blur-md"></div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-float bottom-4 left-[10%]"></div>
        <div className="absolute h-5 w-5 rounded-full bg-blue-400/10 animate-float bottom-6 left-[20%] [animation-delay:0.5s]"></div>
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-float bottom-6 left-[30%] [animation-delay:0.5s]"></div>
        <div className="absolute h-5 w-5 rounded-full bg-blue-400/10 animate-float bottom-8 left-[70%] [animation-delay:1s]"></div>
        <div className="absolute h-6 w-6 rounded-full bg-blue-400/10 animate-float bottom-2 left-[50%] [animation-delay:1.5s]"></div>
        <div className="absolute h-3 w-3 rounded-full bg-blue-400/10 animate-float bottom-10 left-[80%] [animation-delay:1.2s]"></div>
      </div>

      {/* Footer Content */}
      <div className="relative px-4 sm:px-8 py-4 text-center">
        <p className="text-white text-sm sm:text-base font-medium">
          © 2024 MovieScout. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;