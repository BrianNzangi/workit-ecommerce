'use client';

import { FolderTree, Layers, LayoutGrid, ListTree, ChevronDown } from 'lucide-react';

interface Collection {
    id: string;
    name: string;
    slug: string;
    children?: Collection[];
}

interface CollectionHierarchyFieldsProps {
    level: '1' | '2' | '3';
    setLevel: (level: '1' | '2' | '3') => void;
    collections: Collection[];
    selectedL1: string;
    setSelectedL1: (id: string) => void;
    parentId: string;
    setParentId: (id: string) => void;
}

export function CollectionHierarchyFields({
    level,
    setLevel,
    collections,
    selectedL1,
    setSelectedL1,
    parentId,
    setParentId
}: CollectionHierarchyFieldsProps) {
    return (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xs mb-4">
            <label className="block text-sm font-bold text-orange-800 mb-2 uppercase tracking-tight">
                Hierarchy Level *
            </label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: '1', label: 'Level 1', desc: 'Category', icon: Layers },
                    { id: '2', label: 'Level 2', desc: 'Group', icon: LayoutGrid },
                    { id: '3', label: 'Level 3', desc: 'Sub', icon: ListTree }
                ].map((lvl) => (
                    <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                            setParentId('');
                            setLevel(lvl.id as any);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xs border-2 transition-all ${level === lvl.id
                            ? 'border-primary-900 bg-white shadow-sm ring-1 ring-primary-900/20'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                            }`}
                    >
                        <lvl.icon className={`w-5 h-5 mb-1 ${level === lvl.id ? 'text-primary-900' : 'text-gray-400'}`} />
                        <span className={`text-xs font-bold ${level === lvl.id ? 'text-primary-900' : ''}`}>{lvl.label}</span>
                        <span className="text-[10px] uppercase opacity-60 font-medium">{lvl.desc}</span>
                    </button>
                ))}
            </div>
            <p className="mt-2 text-[11px] text-orange-700/70 font-medium italic">
                {level === '1' && "Root category (e.g. 'Men'). No parent needed."}
                {level === '2' && "Navigation header (e.g. 'Clothing'). Requires L1 parent."}
                {level === '3' && "Direct link to products (e.g. 'T-Shirts'). Requires L2 parent."}
            </p>

            {level !== '1' && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                        <label htmlFor="l1Selection" className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                            <FolderTree className="w-4 h-4 text-gray-400" />
                            {level === '2' ? 'Select Parent Category (L1) *' : 'Select Target Category (L1) *'}
                        </label>
                        <div className="relative">
                            <select
                                id="l1Selection"
                                value={selectedL1}
                                onChange={(e) => {
                                    setSelectedL1(e.target.value);
                                    if (level === '2') {
                                        setParentId(e.target.value);
                                    } else {
                                        setParentId('');
                                    }
                                }}
                                required
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="">-- Choose Category --</option>
                                {collections.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {level === '3' && selectedL1 && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                                <FolderTree className="w-4 h-4 text-gray-400" />
                                Select Parent Group (L2) *
                            </label>
                            <div className="relative">
                                <select
                                    id="parentId"
                                    name="parentId"
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent appearance-none bg-white font-semibold text-gray-900"
                                >
                                    <option value="">-- Choose Group --</option>
                                    {collections.find(c => c.id === selectedL1)?.children?.map((l2) => (
                                        <option key={l2.id} value={l2.id}>{l2.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                            <p className="mt-1 text-[11px] text-gray-500 italic">
                                Showing groups inside "{collections.find(c => c.id === selectedL1)?.name || ''}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
