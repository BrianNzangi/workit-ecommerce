interface CustomersTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TABS = [
    { id: 'all', label: 'All Customers' },
    { id: 'new', label: 'New Customers' },
    { id: 'returning', label: 'Returning Customers' },
];

export function CustomersTabs({ activeTab, onTabChange }: CustomersTabsProps) {
    return (
        <div className="mb-4 flex gap-6 border-b border-gray-100">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                            ? 'border-primary-900 text-primary-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
