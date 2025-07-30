'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BarChart3,
  DollarSign,
  Activity,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Target,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CapacityScorecard() {
  // — static capacity & crew data for now
  const [capacityData] = useState({
    currentUtilization: 75,
    pipelineHealth:    68,
    commitedRevenue:   45000,
    monthlyTarget:     60000,
    crewEfficiency:    92,
    bidsNeeded:        12,
    availableCrews:    4,
    totalCrews:        5,
  })

  const [crewData] = useState([
    { name: 'Team Alpha', utilization: 95, efficiency: 110, revenue: 12500, status: 'overloaded'   },
    { name: 'Team Beta',  utilization: 85, efficiency: 95,  revenue: 11200, status: 'optimal'      },
    { name: 'Team Gamma', utilization: 65, efficiency: 85,  revenue:  8900, status: 'underutilized'},
    { name: 'Team Delta', utilization: 40, efficiency: 88,  revenue:  5400, status: 'available'    },
  ])

  // — dynamic pipeline data from Supabase
  const [pipelineData, setPipelineData] = useState({
    pendingBids:      0,
    awaitingResponse: 0,
    wonThisWeek:      0,
    lostThisWeek:     0,
    averageWinRate:   0,
  })

  useEffect(() => {
    async function loadPipeline() {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      // fetch all counts in parallel
      const [
        { count: pending = 0 },
        { count: awaiting_response = 0 },
        { count: won = 0 },
        { count: lost = 0 },
      ] = await Promise.all([
        supabase
          .from('bids')
          .select('id', { head: true, count: 'exact' })
          .eq('status', 'pending'),
        supabase
          .from('bids')
          .select('id', { head: true, count: 'exact' })
          .eq('status', 'awaiting_response'),
        supabase
          .from('bids')
          .select('id', { head: true, count: 'exact' })
          .eq('status', 'won')
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('bids')
          .select('id', { head: true, count: 'exact' })
          .eq('status', 'lost')
          .gte('created_at', weekAgo.toISOString()),
      ])

      const total = won + lost
      const winRate = total > 0 ? Math.round((won / total) * 100) : 0

      setPipelineData({
        pendingBids:      pending,
        awaitingResponse: awaiting_response,
        wonThisWeek:      won,
        lostThisWeek:     lost,
        averageWinRate:   winRate,
      })
    }

    loadPipeline()
  }, [])

  // helper for progress bars
  const getProgressColor = (pct: number) =>
    pct >= 90 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'

  // helper for crew badges
  const getBadgeConfig = (status: string) => {
    const cfg = {
      overloaded:     { color: 'bg-red-500',    text: 'Overloaded'    },
      optimal:        { color: 'bg-green-500',  text: 'Optimal'       },
      underutilized:  { color: 'bg-yellow-500', text: 'Underutilized' },
      available:      { color: 'bg-blue-500',   text: 'Available'     },
    }
    return cfg[status as keyof typeof cfg] || cfg.optimal
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Capacity Scorecard</h1>
          <p className="text-blue-200 text-lg">
            Optimize your bidding strategy and maximize profitable capacity
          </p>
        </div>

        {/* 🔹 Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Capacity Utilization */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-blue-100">Capacity Utilization</CardTitle>
              <Users className="h-5 w-5 text-blue-200"/>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{capacityData.currentUtilization}%</div>
              <div className="w-full bg-blue-800 rounded-full h-2 mb-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${capacityData.currentUtilization}%` }}
                />
              </div>
              <p className="text-xs text-blue-200">
                {capacityData.availableCrews} of {capacityData.totalCrews} crews active
              </p>
            </CardContent>
          </Card>

          {/* Pipeline Health */}
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500 text-white">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-purple-100">Pipeline Health</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-200"/>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{capacityData.pipelineHealth}%</div>
              <div className="w-full bg-purple-800 rounded-full h-2 mb-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${capacityData.pipelineHealth}%` }}
                />
              </div>
              <p className="text-xs text-purple-200">
                Need {capacityData.bidsNeeded} more bids to hit capacity
              </p>
            </CardContent>
          </Card>

          {/* Revenue Runway */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-green-100">Revenue Runway</CardTitle>
              <DollarSign className="h-5 w-5 text-green-200"/>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                ${capacityData.commitedRevenue.toLocaleString()}
              </div>
              <div className="w-full bg-green-800 rounded-full h-2 mb-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${(capacityData.commitedRevenue / capacityData.monthlyTarget) *
                      100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-green-200">
                ${(capacityData.monthlyTarget - capacityData.commitedRevenue).toLocaleString()}
                {' '}needed for target
              </p>
            </CardContent>
          </Card>

          {/* Avg Crew Efficiency */}
          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500 text-white">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm text-orange-100">Avg Crew Efficiency</CardTitle>
              <Activity className="h-5 w-5 text-orange-200"/>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{capacityData.crewEfficiency}%</div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-200"/>
                <span className="text-xs text-orange-200">+5% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Crew Performance */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5"/>
                <span>Crew Performance</span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Current utilization and efficiency by team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewData.map((c, i) => {
                  const badge = getBadgeConfig(c.status)
                  return (
                    <div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white text-lg font-semibold">{c.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${badge.color} text-white border-0`}>
                            {badge.text}
                          </Badge>
                          <span className="text-white font-bold">
                            {c.utilization}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                        <div>
                          <div className="text-2xl font-bold text-white">
                            {c.efficiency}%
                          </div>
                          <div className="text-xs text-blue-200">Efficiency</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ${c.revenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-200">Revenue</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ${Math.round(c.revenue / 160)}
                          </div>
                          <div className="text-xs text-blue-200">$/Hour</div>
                        </div>
                      </div>

                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className={`${getProgressColor(c.utilization)} rounded-full h-2 transition-all duration-500`}
                          style={{ width: `${c.utilization}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Status (dynamic) */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Target className="h-5 w-5"/>
                <span>Pipeline Status</span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Current bid activity and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: <Clock className="h-4 w-4 text-yellow-400"/>,
                  label: 'Pending Bids',
                  value: pipelineData.pendingBids,
                  color: 'text-white'
                },
                {
                  icon: <Eye className="h-4 w-4 text-blue-400"/>,
                  label: 'Awaiting Response',
                  value: pipelineData.awaitingResponse,
                  color: 'text-white'
                },
                {
                  icon: <CheckCircle className="h-4 w-4 text-green-400"/>,
                  label: 'Won This Week',
                  value: pipelineData.wonThisWeek,
                  color: 'text-green-400'
                },
                {
                  icon: <XCircle className="h-4 w-4 text-red-400"/>,
                  label: 'Lost This Week',
                  value: pipelineData.lostThisWeek,
                  color: 'text-red-400'
                },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {icon}
                    <span className="text-blue-200">{label}</span>
                  </div>
                  <span className={`font-bold ${color} text-xl`}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Win Rate Bar */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between mb-3">
                  <span className="text-blue-200 font-medium">Win Rate</span>
                  <span className="font-bold text-white text-xl">
                    {pipelineData.averageWinRate}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 rounded-full h-3 transition-all duration-500"
                    style={{ width: `${pipelineData.averageWinRate}%` }}
                  />
                </div>
                
                {/* View All Bids Button */}
                <Link 
                  href="/bids" 
                  className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white text-sm font-medium rounded-lg transition-colors border border-blue-400/30"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Bids
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Smart Recommendations */}
          <Card className="lg:col-span-3 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-400"/>
                <span>Smart Recommendations</span>
              </CardTitle>
              <CardDescription className="text-blue-200">
                AI-powered insights to optimize your capacity and bidding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-500/20 rounded-lg border-blue-400/30 backdrop-blur-sm">
                  <h4 className="text-white font-semibold mb-2">Bidding Strategy</h4>
                  <p className="text-blue-100 text-sm">
                    Submit 8 more bids this week to maintain 90% capacity utilization for next month.
                  </p>
                </div>
                <div className="p-6 bg-yellow-500/20 rounded-lg border-yellow-400/30 backdrop-blur-sm">
                  <h4 className="text-white font-semibold mb-2">Capacity Alert</h4>
                  <p className="text-yellow-100 text-sm">
                    Team Alpha is at 95% capacity. Consider redistributing workload or increasing pricing.
                  </p>
                </div>
                <div className="p-6 bg-green-500/20 rounded-lg border-green-400/30 backdrop-blur-sm">
                  <h4 className="text-white font-semibold mb-2">Growth Opportunity</h4>
                  <p className="text-green-100 text-sm">
                    Based on current demand, you could support 1 additional crew by March.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}