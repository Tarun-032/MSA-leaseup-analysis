import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  GitBranch,
  Bot,
  Building2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const navSections = [
  {
    label: 'ANALYSIS',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'leaseup', label: 'Lease-Up Analysis', icon: TrendingUp },
      { id: 'rentgrowth', label: 'Rent Growth', icon: TrendingDown },
      { id: 'clusters', label: 'Cluster Explorer', icon: GitBranch },
    ],
  },
  {
    label: 'AI FEATURES',
    items: [{ id: 'ai', label: 'AI Assistant', icon: Bot }],
  },
];

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 bg-white border-r border-[#F0F0F0] flex flex-col z-30"
      style={{
        width: collapsed ? 68 : 240,
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Logo */}
      <div className={`pt-6 pb-4 ${collapsed ? 'px-0 flex justify-center' : 'px-5'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 size={20} className="text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight whitespace-nowrap">LeaseUp</h1>
              <p className="text-[11px] text-gray-400 font-light whitespace-nowrap">Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden" style={{ paddingLeft: collapsed ? 8 : 12, paddingRight: collapsed ? 8 : 12 }}>
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-semibold text-gray-400 tracking-[0.08em] uppercase whitespace-nowrap overflow-hidden">
                {section.label}
              </p>
            )}
            {collapsed && <div className="mb-1" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-150 cursor-pointer ${
                    collapsed
                      ? 'justify-center px-0 py-2.5 mb-1'
                      : 'gap-3 px-4 py-2.5'
                  } ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  } text-sm font-medium`}
                  style={isActive && !collapsed ? { boxShadow: 'inset 3px 0 0 0 #6366F1' } : isActive && collapsed ? { boxShadow: 'inset 0 -2px 0 0 #6366F1' } : {}}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer: status + collapse toggle */}
      <div className="border-t border-gray-100">
        {!collapsed && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <p className="text-[11px] text-gray-400">249 properties loaded</p>
          </div>
        )}
        <div className={`py-3 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-600"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
