'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type EventType = 'Transfer' | 'Approval' | 'Mint' | 'Burn'

interface Event {
  type: EventType
  from: string
  to: string
  value: string
  blockNumber: number
  timestamp: string
}

interface EventCount {
  [key: string]: number
}

interface ChartData {
  name: string
  value: number
}

interface HourlyData {
  hour: number
  count: number
}

// Test data generator
const generateTestData = (count: number): Event[] => {
  const eventTypes: EventType[] = ['Transfer', 'Approval', 'Mint', 'Burn']
  const now = new Date()
  return Array.from({ length: count }, (_, i) => ({
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    from: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
    to: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
    value: (Math.random() * 10).toFixed(4),
    blockNumber: 1000000 + i,
    timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000).toLocaleString(),
  }))
}

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState<string>('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    setEvents([])

    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new Error('Invalid contract address')
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const testEvents = generateTestData(100)
      setEvents(testEvents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const eventCounts: EventCount = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as EventCount)

  const pieChartData: ChartData[] = Object.entries(eventCounts).map(([name, value]) => ({ name, value }))

  const hourlyEventCounts: EventCount = events.reduce((acc, event) => {
    const hour = new Date(event.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as EventCount)

  const barChartData: HourlyData[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyEventCounts[i] || 0
  }))

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Event Monitor</CardTitle>
          <CardDescription>Enter a contract address to view simulated events from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Contract Address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
            />
            <Button onClick={fetchEvents} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fetch Events'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {events.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Event Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>From/Owner</TableHead>
                    <TableHead>To/Spender</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 10).map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={
                          event.type === "Transfer" ? "default" :
                          event.type === "Approval" ? "secondary" :
                          event.type === "Mint" ? "outline" : "destructive"
                        }>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.from}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.to}
                      </TableCell>
                      <TableCell>{event.value} ETH</TableCell>
                      <TableCell>{event.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}