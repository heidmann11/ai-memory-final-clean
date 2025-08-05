// components/dashboard/PageToolbar.tsx
import React, { Fragment } from 'react'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import {
  Zap,
  MessageCircle,
  TrendingUp,
  Cpu,
  Tag,
  DollarSign,
  BookOpen,
  Truck,
  ChevronDown
} from 'lucide-react'

interface PrimaryAction {
  label: string
  href: string
  icon: React.ComponentType
}

interface OverflowAction {
  label: string
  onClick: () => void
  icon: React.ComponentType
}

/**
 * PageToolbar: page-level action bar placed below the global Header.
 *
 * Props:
 *  - primary: Array of { label, href, icon }
 *  - overflow: Array of { label, onClick, icon }
 */
export function PageToolbar({
  primary,
  overflow,
}: {
  primary: PrimaryAction[]
  overflow: OverflowAction[]
}) {
  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 border border-white/20">
      {/* Primary links */}
      <nav className="flex gap-4">
        {primary.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-white/20 rounded hover:bg-white/30 transition"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Overflow menu */}
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-white/20 rounded hover:bg-white/30 transition">
          More <ChevronDown className="w-4 h-4" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg focus:outline-none">
            {overflow.map((item) => (
              <Menu.Item key={item.label}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center w-full gap-2 px-4 py-2 text-sm transition ${
                      active ? 'bg-white/20' : ''
                    } text-white`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}
