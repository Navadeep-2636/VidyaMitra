'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Zap, RefreshCw, Briefcase, MapPin, Globe, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export default function CareersPage() {
    const params = useParams()
    const locale = params.locale as string

    // Career Path State
    const [jobs, setJobs] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [skill, setSkill] = useState('')
    const [searchLocation, setSearchLocation] = useState('India')
    const [jobType, setJobType] = useState<'job' | 'internship'>('job')

    const handleSearchJobs = async () => {
        if (!skill) return
        setIsSearching(true)
        try {
            const response = await fetch('/api/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill, location: searchLocation, type: jobType })
            })
            const data = await response.json()
            setJobs(data.jobs || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-12 pb-32">
            <header className="text-center space-y-4 py-12 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent rounded-3xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4"
                >
                    <Briefcase size={16} />
                    Career Opportunities
                </motion.div>
                <h1 className="text-5xl font-extrabold font-heading text-dark dark:text-white leading-tight">
                    Find Your Next <span className="gradient-text">Big Move</span>
                </h1>
                <p className="text-secondary dark:text-slate-400 text-xl max-w-2xl mx-auto">
                    Real-time jobs and internships tailored to your skills. Powered by JSearch.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8 z-30">
                <div className="grid lg:grid-cols-12 gap-6 items-end">
                    <div className="lg:col-span-5 space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Search size={14} /> Skill or Role
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. React Developer, Data Scientist..."
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none text-lg transition-all bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-dark dark:text-white"
                        />
                    </div>
                    <div className="lg:col-span-3 space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                            <MapPin size={14} /> Location
                        </label>
                        <select
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-lg transition-all appearance-none text-dark dark:text-white"
                        >
                            <option value="Bangalore">🇮🇳 Bangalore</option>
                            <option value="Hyderabad">🇮🇳 Hyderabad</option>
                            <option value="Mumbai">🇮🇳 Mumbai</option>
                            <option value="Delhi">🇮🇳 Delhi</option>
                            <option value="San Francisco">🇺🇸 San Francisco</option>
                            <option value="New York">🇺🇸 New York</option>
                            <option value="Remote">Remote</option>
                            <option value="World">Worldwide</option>
                        </select>
                    </div>
                    <div className="lg:col-span-4 space-y-3">
                        <label className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
                            Type of Opportunity
                        </label>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full">
                            <button
                                onClick={() => setJobType('job')}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    jobType === 'job' ? "bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                <Briefcase size={16} /> Jobs
                            </button>
                            <button
                                onClick={() => setJobType('internship')}
                                className={clsx(
                                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                                    jobType === 'internship' ? "bg-white dark:bg-slate-700 text-primary dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                <Globe size={16} /> Internships
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSearchJobs}
                    disabled={isSearching || !skill}
                    className="w-full py-5 bg-dark text-white font-extra-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-lg shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                    {isSearching ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
                    Explore Opportunities
                </button>
            </div>

            {jobs.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job: any, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="px-3 py-1 bg-primary/5 dark:bg-blue-400/10 text-primary dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10 dark:border-blue-400/20">
                                    {job.type}
                                </span>
                            </div>

                            <div className="flex-grow space-y-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl text-dark dark:text-white leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-secondary dark:text-slate-300 font-semibold flex items-center gap-2">
                                        🏢 {job.company}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-500">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        📍 {job.location}
                                    </span>
                                </div>
                            </div>

                            <a
                                href={job.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 block w-full text-center py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-dark dark:text-white hover:bg-primary dark:hover:bg-blue-600 hover:border-primary dark:hover:border-blue-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                            >
                                Apply Now
                            </a>
                        </motion.div>
                    ))}
                </div>
            )}

            {!isSearching && jobs.length === 0 && (
                <div className="text-center py-32 space-y-6 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                        <Briefcase size={40} className="text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-400">Start your career search</h2>
                        <p className="text-slate-300">Enter a skill above to see live opportunities from around the globe</p>
                    </div>
                </div>
            )}

            {isSearching && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-slate-100/50 rounded-3xl animate-pulse" />
                    ))}
                </div>
            )}
        </div>
    )
}
