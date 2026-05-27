"use client"

import { JSX, useState } from "react";
import { Zap, ChevronRight, ChevronLeft, Search, X } from "lucide-react";
import { Cpu, Gauge, Radio, Clock, Flame, Wifi, Wind, Radar, Thermometer, Compass, Car, Settings, Triangle, Rotate3d } from 'lucide-react';
import { componentsList } from "../electrical-components/components-list";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({
    collapsed,
    onToggle,
}: SidebarProps) {

    const [searchTerm, setSearchTerm] = useState('');


    return (
        <div
            className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? "w-12" : "w-80"
                }`}
        >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!collapsed && (
                    <div>
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-500" />
                            Components
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                            {Object.values(componentsList).flat().length} available
                        </p>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-3 h-3 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Components List */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4 flex flex-wrap gap-4 items-stretch">
                        {Object.keys(componentsList).map((category) => (
                            <div key={category}>
                                <span className="px-3 py-1 rounded shadow border">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
