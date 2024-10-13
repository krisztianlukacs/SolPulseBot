'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, X } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { io } from 'socket.io-client';


type EventType = 'contract' | 'diagnostic' | 'system' | 'Transfer' | 'Approval' | 'Mint' | 'Burn'

interface Event {
  type: EventType
  from: string
  to: string
  value: string
  ledger: number
  time: string
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

function generateRandomString(length:number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
  }
  
  return result;
}

function getRandomDateFromMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight of today

  // Generate a random time in milliseconds from midnight to now
  const randomTime = Math.floor(Math.random() * (now.getTime() - midnight.getTime()));

  // Create a new date object with the random time added to midnight
  const randomDate = new Date(midnight.getTime() + randomTime);
  
  return randomDate;
}

// Test data generator
const generateTestData = (count: number): Event[] => {
  const eventTypes: EventType[] = ['contract', 'system']
  const now = new Date()
  return Array.from({ length: count }, (_, i) => ({
    id: generateRandomString(10),
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    from: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
    to: `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`,
    value: (Math.random() * 10).toFixed(4),
    ledger: 1000000 + i,
    time: getRandomDateFromMidnight().toISOString(),
  }))
}

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState<string>('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const socket = io('http://localhost:4000'); // Connect to WebSocket server

  // useEffect(() => {
  //   socket.connect()
  //   // Listen for events
  //   socket.emit("message", "hellow world", () => {
  //     console.log("yello")
  //   })

  //   socket.on("message", events => {
  //     console.log("events bro", events)
  //   })


  //   // Clean up on unmount
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (contractAddress != "" && events.length > 0) {
        fetchEventsAuto()
      }
    }, 5000);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [contractAddress,events])

  // useEffect(() => {
  //   if (contractAddress !== "") {
  //     socket.emit("message", contractAddress)
  //   }
  // }, [contractAddress])

  function deduplicateById(array:any[]) {
    const uniqueIds = new Set();
    return array.filter(item => {
        if (!uniqueIds.has(item.id)) {
            uniqueIds.add(item.id);
            return true; // Keep this item
        }
        return false; // Skip this item
    });
}


  const fetchEventsAuto = async () => {
    const newEvents = await fetch(`http://localhost:4000/contracts/${contractAddress}`)
      .then(f => f.json())
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(events,newEvents,"just how")
    setEvents(deduplicateById([
      ...newEvents,
      ...events
    ]))
  }

  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    setEvents([])

    try {
      // if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      //   throw new Error('Invalid contract address')
      // }
      const newEvents = await fetch(`http://localhost:4000/contracts/${contractAddress}`)
        .then(f => f.json())
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEvents([
        ...newEvents,
        ...generateTestData(5)
      ])

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
    const hour = new Date(event.time).getHours()
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
                      <Legend />
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
                    <TableHead>Date</TableHead>
                    <TableHead>Event Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <TableCell>{event.time}</TableCell>
                      <TableCell>
                        <Badge variant={
                          event.type === "Mint" ? "default" :
                            event.type === "system" ? "secondary" :
                              event.type === "diagnostic" ? "outline" : "destructive"
                        }>
                          {event.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Raw JSON content of the selected event
            </DialogDescription>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
            {JSON.stringify(selectedEvent, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}