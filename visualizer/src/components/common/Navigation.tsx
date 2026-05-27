"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, Database, Play, Map } from "lucide-react"

export default function Navigation() {
    const pathname = usePathname()

    const navItems = [
        {
            href: "/",
            label: "Circuit Generator",
            icon: Zap,
        },
        {
            href: "/components",
            label: "Components",
            icon: Map,
        },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Zap className="h-6 w-6 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">CircuitLM</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    )
}
