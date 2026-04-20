"use client"

import Link from "next/link"
import { Bitcoin, Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Bitcoin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CryptoVault</span>
            </Link>
            <p className="text-sm text-gray-600">
              The most trusted cryptocurrency trading platform. Trade with confidence using our secure and intuitive platform.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-blue-600"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-blue-600"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 transition-colors hover:text-blue-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@cryptovault.com"
                className="text-gray-500 transition-colors hover:text-blue-600"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900">Products</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Spot Trading
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Futures Trading
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Staking
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  NFT Marketplace
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  API Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900">Resources</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Fees
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Risk Disclosure
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-blue-600">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} CryptoVault. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
