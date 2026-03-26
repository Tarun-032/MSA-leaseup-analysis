import { Sparkles } from 'lucide-react';

const pageTitles = {
  overview: 'Overview',
  leaseup: 'Lease-Up Analysis',
  rentgrowth: 'Rent Growth',
  clusters: 'Cluster Explorer',
  ai: 'AI Assistant',
};

export default function Header({ activePage, onTogglePanel }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-surface sticky top-0 z-10">
      <h2 className="text-2xl font-semibold text-gray-900">
        {pageTitles[activePage] || 'Overview'}
      </h2>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          249 properties &middot; Austin TX &middot; Akron OH
        </span>
        {activePage !== 'ai' && (
          <button
            onClick={onTogglePanel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Sparkles size={16} />
            Ask AI
          </button>
        )}
      </div>
    </header>
  );
}
