/**
 * Register Page Hero Section
 * Separated UI component for better maintainability
 */

import { Award, Zap, Users } from 'lucide-react'

export function RegisterHero() {
  return (
    <div className="hidden lg:block space-y-6">
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/30 text-primary dark:text-accent text-xs font-semibold uppercase tracking-wide">
        New Recruitment Drive
      </div>
      
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
        Start your career journey with{' '}
        <span className="text-primary dark:text-accent">ERMS</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">
        Join thousands of professionals who have accelerated their careers through our
        comprehensive training programs and exclusive job placements.
      </p>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/30 flex items-center justify-center text-primary dark:text-accent">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Certified Training
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Industry recognized certifications.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="h-10 w-10 rounded-lg bg-coral/10 flex items-center justify-center text-coral">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Fast-Track Hiring
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Direct access to top employers.
          </p>
        </div>
      </div>

      <div className="pt-6 flex items-center gap-4">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800" />
          <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800" />
          <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800" />
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
            +2k
          </div>
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Joined this month
        </p>
      </div>
    </div>
  )
}
