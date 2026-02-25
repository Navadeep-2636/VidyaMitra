'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
    Zap, RefreshCw, Milestone, ListChecks, Play, Target, Clock,
    BookOpen, Brain, TrendingUp, User, ChevronDown, ExternalLink,
    Youtube, BookMarked, Globe, CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useNarrator } from '@/hooks/useNarrator'

interface UserProfile {
    goal: string
    desiredOutcome: string
    skillLevel: string
    background: string
    hoursPerWeek: string
    timeline: string
    learningStyle: string
    resourceTypes: string
    budget: string
    motivation: string
    constraints: string
}

const defaultProfile: UserProfile = {
    goal: '',
    desiredOutcome: '',
    skillLevel: 'beginner',
    background: '',
    hoursPerWeek: '10',
    timeline: '3 months',
    learningStyle: 'mixed',
    resourceTypes: 'free',
    budget: '$0 (free only)',
    motivation: 'career switch',
    constraints: 'full-time job'
}

function FieldLabel({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <Icon size={15} className="text-primary" />
            {label}
        </label>
    )
}

export default function RoadmapPage() {
    const params = useParams()
    const locale = params.locale as string
    const { speak, stop, isSpeaking } = useNarrator()

    const [profile, setProfile] = useState<UserProfile>(defaultProfile)
    const [isGenerating, setIsGenerating] = useState(false)
    const [roadmap, setRoadmap] = useState<any>(null)
    const [showForm, setShowForm] = useState(true)

    const update = (field: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setProfile(prev => ({ ...prev, [field]: e.target.value }))

    const handleGenerate = async () => {
        if (!profile.goal) return
        setIsGenerating(true)
        setRoadmap(null)
        try {
            const response = await fetch('/api/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, language: locale })
            })
            const data = await response.json()
            setRoadmap(data)
            setShowForm(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsGenerating(false)
        }
    }

    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
    const selectCls = `${inputCls} cursor-pointer`

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-10">
            {/* Header */}
            <header className="text-center space-y-3">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                        <Zap size={14} /> AI-Powered Personalized Learning
                    </span>
                    <h1 className="text-4xl font-bold font-heading text-dark dark:text-white">Your Custom Learning Roadmap</h1>
                    <p className="text-secondary text-lg mt-2">
                        {profile.goal ? `Customized path to master "${profile.goal}"` : 'Fill your profile → get a precise, personalized roadmap'}
                    </p>
                </motion.div>
            </header>

            {/* Form Toggle */}
            {roadmap && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all shadow-sm"
                    >
                        <User size={15} />
                        {showForm ? 'Hide Profile Form' : 'Edit My Profile'}
                        <ChevronDown size={15} className={clsx('transition-transform', showForm && 'rotate-180')} />
                    </button>
                </div>
            )}

            {/* Multi-field Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden"
                    >
                        {/* Form header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                                <User size={18} className="text-primary" /> Tell us about yourself
                            </h2>
                            <p className="text-secondary text-sm mt-1">The more detail you provide, the more precise your roadmap will be</p>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Goal */}
                            <div className="md:col-span-2">
                                <FieldLabel icon={Target} label="What do you want to master? *" />
                                <input
                                    type="text"
                                    value={profile.goal}
                                    onChange={update('goal')}
                                    placeholder="e.g. Machine Learning, Web Development, Data Science..."
                                    className={inputCls}
                                />
                            </div>

                            {/* Desired Outcome */}
                            <div className="md:col-span-2">
                                <FieldLabel icon={TrendingUp} label="What specific outcome do you want?" />
                                <textarea
                                    value={profile.desiredOutcome}
                                    onChange={update('desiredOutcome')}
                                    placeholder="e.g. Get a job as a ML Engineer at a top tech company, build my own SaaS..."
                                    rows={2}
                                    className={inputCls}
                                />
                            </div>

                            {/* Skill Level */}
                            <div>
                                <FieldLabel icon={Brain} label="Current Skill Level" />
                                <select value={profile.skillLevel} onChange={update('skillLevel')} className={selectCls}>
                                    <option value="complete beginner">Complete Beginner (no prior knowledge)</option>
                                    <option value="beginner">Beginner (basics only)</option>
                                    <option value="intermediate">Intermediate (some experience)</option>
                                    <option value="advanced">Advanced (professional experience)</option>
                                </select>
                            </div>

                            {/* Background */}
                            <div>
                                <FieldLabel icon={BookOpen} label="Background / What you already know" />
                                <input
                                    type="text"
                                    value={profile.background}
                                    onChange={update('background')}
                                    placeholder="e.g. Python basics, high school math, 1yr coding experience..."
                                    className={inputCls}
                                />
                            </div>

                            {/* Hours/week */}
                            <div>
                                <FieldLabel icon={Clock} label="Hours available per week" />
                                <select value={profile.hoursPerWeek} onChange={update('hoursPerWeek')} className={selectCls}>
                                    <option value="5">5 hrs/week (very busy)</option>
                                    <option value="10">10 hrs/week</option>
                                    <option value="20">20 hrs/week (part-time)</option>
                                    <option value="40">40+ hrs/week (full-time)</option>
                                </select>
                            </div>

                            {/* Timeline */}
                            <div>
                                <FieldLabel icon={Clock} label="Target Timeline" />
                                <select value={profile.timeline} onChange={update('timeline')} className={selectCls}>
                                    <option value="1 month">1 month (sprint)</option>
                                    <option value="3 months">3 months</option>
                                    <option value="6 months">6 months</option>
                                    <option value="1 year">1 year</option>
                                    <option value="2 years">2+ years (deep mastery)</option>
                                </select>
                            </div>

                            {/* Learning style */}
                            <div>
                                <FieldLabel icon={BookOpen} label="Learning Style" />
                                <select value={profile.learningStyle} onChange={update('learningStyle')} className={selectCls}>
                                    <option value="video">Video-based (YouTube, courses)</option>
                                    <option value="text">Text/Reading (books, docs, blogs)</option>
                                    <option value="project-based">Project-based (build things)</option>
                                    <option value="mixed">Mixed (all of the above)</option>
                                </select>
                            </div>

                            {/* Resource types */}
                            <div>
                                <FieldLabel icon={Globe} label="Preferred Resource Types" />
                                <select value={profile.resourceTypes} onChange={update('resourceTypes')} className={selectCls}>
                                    <option value="free">Free only (YouTube, docs, blogs)</option>
                                    <option value="paid">Paid courses (Udemy, Coursera, etc.)</option>
                                    <option value="books">Books / Textbooks</option>
                                    <option value="mixed">Mixed (free + paid)</option>
                                </select>
                            </div>

                            {/* Motivation */}
                            <div>
                                <FieldLabel icon={Target} label="Motivation / Goal Type" />
                                <select value={profile.motivation} onChange={update('motivation')} className={selectCls}>
                                    <option value="career switch">Career Switch</option>
                                    <option value="get a job">Get a Job / Job-ready</option>
                                    <option value="startup">Build a Startup / Product</option>
                                    <option value="exam">Exam / Certification</option>
                                    <option value="academic">Academic / Research</option>
                                    <option value="curiosity">Personal Interest / Curiosity</option>
                                    <option value="freelancing">Freelancing</option>
                                </select>
                            </div>

                            {/* Constraints */}
                            <div>
                                <FieldLabel icon={User} label="Your Current Situation" />
                                <select value={profile.constraints} onChange={update('constraints')} className={selectCls}>
                                    <option value="full-time job">Working Full-Time</option>
                                    <option value="student">Student</option>
                                    <option value="part-time job">Working Part-Time</option>
                                    <option value="unemployed">Unemployed / Full availability</option>
                                    <option value="parent">Parent with limited time</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="px-8 pb-8">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !profile.goal}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                            >
                                {isGenerating
                                    ? <><RefreshCw className="animate-spin" size={20} /> Crafting your personalized roadmap...</>
                                    : <><Zap size={20} /> Generate My Roadmap</>
                                }
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading state */}
            {isGenerating && (
                <div className="text-center py-16 space-y-4">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl text-primary font-semibold">
                        <RefreshCw className="animate-spin" size={20} />
                        AI is analyzing your profile and crafting your personalized roadmap...
                    </div>
                    <p className="text-slate-400 text-sm">This may take 10–20 seconds for a thorough plan</p>
                </div>
            )}

            {/* Roadmap Display */}
            <AnimatePresence>
                {roadmap && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Overview */}
                        {roadmap.overview && (
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 border border-primary/10">
                                <h2 className="text-xl font-bold text-primary mb-3 flex items-center gap-2">
                                    <Brain size={20} /> Learning Strategy Overview
                                </h2>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{roadmap.overview}</p>
                            </div>
                        )}

                        {/* Phases / Steps */}
                        {roadmap.steps && (
                            <div className="relative space-y-12 pb-20">
                                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary/30 to-transparent -z-0" />
                                {roadmap.steps.map((step: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.15 }}
                                        className={clsx("relative flex items-start gap-12", idx % 2 === 0 ? "flex-row" : "flex-row-reverse")}
                                    >
                                        {/* Milestone Dot */}
                                        <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-slate-900 border-4 border-primary rounded-full flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                                            <span className="font-bold text-primary text-sm">{idx + 1}</span>
                                        </div>

                                        {/* Card */}
                                        <div className="w-1/2 bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-primary group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    {step.phase && <span className="text-xs font-bold text-primary uppercase tracking-wider">Phase {idx + 1}</span>}
                                                    <h3 className="text-xl font-bold text-dark dark:text-white mt-1">{step.title}</h3>
                                                </div>
                                                <button
                                                    onClick={() => speak(`${step.title}. ${step.description}`, locale)}
                                                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                                                    title="Listen"
                                                >
                                                    <Play size={15} fill="currentColor" />
                                                </button>
                                            </div>
                                            {step.why && <p className="text-xs text-primary/70 font-medium mb-2 italic">{step.why}</p>}
                                            <p className="text-secondary leading-relaxed mb-5 text-sm">{step.description}</p>

                                            {/* Tasks */}
                                            {step.tasks?.length > 0 && (
                                                <div className="mb-5">
                                                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 flex items-center gap-1"><ListChecks size={12} /> Topics to cover</h4>
                                                    <ul className="space-y-1.5">
                                                        {step.tasks.map((task: string, tIdx: number) => (
                                                            <li key={tIdx} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                                                                {task}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Milestone */}
                                            {step.milestone && (
                                                <div className="bg-primary/5 rounded-xl px-4 py-3 text-sm font-medium text-primary flex items-start gap-2 mb-4">
                                                    <Milestone size={14} className="mt-0.5 shrink-0" />
                                                    <span>{step.milestone}</span>
                                                </div>
                                            )}

                                            {/* Resources */}
                                            {step.resources?.length > 0 && (
                                                <div>
                                                    <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 flex items-center gap-1"><BookMarked size={12} /> Resources</h4>
                                                    <div className="space-y-1.5">
                                                        {step.resources.map((res: any, rIdx: number) => (
                                                            <a
                                                                key={rIdx}
                                                                href={res.url || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                                                            >
                                                                {res.type === 'youtube'
                                                                    ? <Youtube size={13} className="text-red-500 shrink-0" />
                                                                    : res.type === 'blog'
                                                                        ? <Globe size={13} className="shrink-0" />
                                                                        : <BookOpen size={13} className="shrink-0" />}
                                                                {res.title || res.url}
                                                                <ExternalLink size={10} className="opacity-50" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Spacer */}
                                        <div className="w-1/2" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Mastery Checklist */}
                        {roadmap.masterChecklist && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-lg">
                                <h2 className="text-xl font-bold text-dark dark:text-white mb-5 flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-green-500" /> Final Mastery Checklist
                                </h2>
                                <ul className="space-y-2.5">
                                    {roadmap.masterChecklist.map((item: string, idx: number) => (
                                        <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300">
                                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Risk Factors */}
                        {roadmap.risks && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-8 border border-amber-100 dark:border-amber-800/30">
                                <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                                    ⚠️ Risk Factors & How to Avoid Them
                                </h2>
                                <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-sm">{roadmap.risks}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {!roadmap && !isGenerating && (
                <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Milestone size={70} className="mx-auto text-slate-200 dark:text-slate-700 mb-5" />
                    <h2 className="text-2xl font-bold text-slate-400">Your personalized roadmap will appear here</h2>
                    <p className="text-slate-300 dark:text-slate-600 mt-2">Fill in your profile above and hit Generate</p>
                </div>
            )}
        </div>
    )
}
