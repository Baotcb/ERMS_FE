import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { CVScreeningResult } from '../types/application-types'

export function ScreeningResultsCard({ results }: { results: CVScreeningResult }) {
    if (!results) return null

    return (
        <Card className="border-l-4 border-l-blue-500 bg-white">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                    Kết quả đánh giá AI
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                {/* Overall Score */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Điểm tổng quan</span>
                        <span className="text-sm font-bold text-blue-600">{(results.overallScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${results.overallScore * 100}%` }}
                        />
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ScoreItem
                        label="Kỹ năng"
                        score={results.skillMatchScore}
                        color="blue"
                    />
                    <ScoreItem
                        label="Kinh nghiệm"
                        score={results.experienceMatchScore}
                        color="green"
                    />
                    <ScoreItem
                        label="Học vấn"
                        score={results.educationMatchScore}
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-medium mb-2 text-green-700 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Kỹ năng phù hợp
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {results.matchedSkills && results.matchedSkills.length > 0 ? (
                                    results.matchedSkills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                            {skill}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-gray-500 italic">Không tìm thấy</span>
                                )}
                            </div>
                        </div>
                        {results.missingSkills && results.missingSkills.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-orange-700 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Kỹ năng còn thiếu
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.missingSkills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Strengths */}
                    {results.strengths && results.strengths.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 text-slate-700">Điểm mạnh nổi bật</h4>
                            <ul className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {results.strengths.map((strength) => (
                                    <li key={strength} className="text-sm text-slate-600 flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Summary */}
                {results.summary && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Tóm tắt đánh giá</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">{results.summary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ScoreItem({ label, score, color }: { label: string; score: number; color: string }) {
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    }
    const colorClass = colors[color as keyof typeof colors]

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</span>
                <span className="text-xs font-bold text-slate-700">{(score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${score * 100}%` }}
                />
            </div>
        </div>
    )
}
