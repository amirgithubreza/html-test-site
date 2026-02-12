export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-lg">🧠</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                CodeQuiz
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Test and improve your programming knowledge with our comprehensive quiz platform. Track progress and compete!
            </p>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Subjects</h3>
            <ul className="space-y-2.5">
              {['HTML & Markup', 'CSS & Styling', 'JavaScript', 'Python', 'C# (.NET)'].map(s => (
                <li key={s} className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-default">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Features</h3>
            <ul className="space-y-2.5">
              {['3 Difficulty Levels', 'Timed Quizzes', 'Score Tracking', 'Question Bank', 'Combined Mode'].map(f => (
                <li key={f} className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-default">
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5">
              {['User Accounts', 'Admin Dashboard', 'Import Questions (JSON)', 'Progress Analytics', 'Responsive Design'].map(i => (
                <li key={i} className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-default">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © 2024 CodeQuiz. All rights reserved. Built with React & Tailwind CSS.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">Made with ❤️ for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
