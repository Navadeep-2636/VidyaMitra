'use client'

import { clsx } from 'clsx'
import { TrendingUp, CheckCircle2, Zap } from 'lucide-react'

interface ActivityHeatmapProps {
    activityData: { date: string; count: number }[]
}

export function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
    const today = new Date()
    const days = Array.from({ length: 91 }, (_, i) => {
        const d = new Date()
        d.setDate(today.getDate() - (90 - i))
        return d.toISOString().split('T')[0]
    })

    const getActivityLevel = (dateStr: string) => {
        const activity = activityData.find(a => a.date === dateStr)
        if (!activity) return 'bg-slate-100 dark:bg-slate-800/50'
        if (activity.count >= 15) return 'bg-green-700 border border-green-800/20'
        if (activity.count >= 10) return 'bg-green-500 border border-green-600/20'
        if (activity.count >= 5) return 'bg-green-400 border border-green-500/20'
        if (activity.count >= 2) return 'bg-green-300 border border-green-400/20'
        return 'bg-green-100 border border-green-200/20'
    }

    const totalPracticed = activityData.reduce((acc, curr) => acc + curr.count, 0)
    const bestStreak = Math.max(...(activityData.map(a => a.count).concat(0)))

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-dark dark:text-white flex items-center gap-1.5">
                        <TrendingUp className="text-green-500" size={14} /> Activity Heatmap
                    </h4>
                    <p className="text-[10px] text-secondary">Consistency across all subjects</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Less</span>
                    <div className="flex gap-0.5">
                        {[100, 300, 400, 500, 600].map(level => (
                            <div key={level} className={clsx(
                                "w-2.5 h-2.5 rounded-sm",
                                level === 100 ? "bg-slate-100 dark:bg-slate-800" : `bg-green-${level}`
                            )} />
                        ))}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">More</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 justify-center">
                {days.map((date, i) => (
                    <div
                        key={i}
                        title={`${date}: ${activityData.find(a => a.date === date)?.count || 0} cards`}
                        className={clsx(
                            "w-3 h-3 rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-primary/40",
                            getActivityLevel(date)
                        )}
                    />
                ))}
            </div>

            <div className="flex justify-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <CheckCircle2 size={12} className="text-green-500" />
                    Best: {bestStreak}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <Zap size={12} className="text-primary" />
                    Total: {totalPracticed}
                </div>
            </div>
        </div>
    )
}

