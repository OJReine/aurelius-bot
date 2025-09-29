import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  StarIcon,
  CogIcon,
  UserIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Stream {
  id: number
  item_name: string
  creator_name: string
  agency_name: string
  due_date: string
  status: 'active' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

interface DashboardStats {
  activeStreams: number
  completedStreams: number
  overdueStreams: number
  thisWeekStreams: number
}

const Home: NextPage = () => {
  const [user, setUser] = useState<any>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeStreams: 0,
    completedStreams: 0,
    overdueStreams: 0,
    thisWeekStreams: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchStreams()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchStreams()
        } else {
          setStreams([])
          setStats({
            activeStreams: 0,
            completedStreams: 0,
            overdueStreams: 0,
            thisWeekStreams: 0
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setStreams(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      toast.error('Failed to fetch streams')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (streamData: Stream[]) => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    
    const activeStreams = streamData.filter(s => s.status === 'active').length
    const completedStreams = streamData.filter(s => s.status === 'completed').length
    const overdueStreams = streamData.filter(s => s.status === 'overdue').length
    const thisWeekStreams = streamData.filter(s => 
      new Date(s.created_at) >= weekStart
    ).length

    setStats({
      activeStreams,
      completedStreams,
      overdueStreams,
      thisWeekStreams
    })
  }

  const completeStream = async (streamId: number) => {
    try {
      const { error } = await supabase
        .from('streams')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', streamId)

      if (error) throw error

      toast.success('Stream completed successfully!')
      fetchStreams()
    } catch (error) {
      console.error('Error completing stream:', error)
      toast.error('Failed to complete stream')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">◆</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aurelius</h1>
            <p className="text-gray-600">Your Personal IMVU Modeling Assistant</p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6B73FF',
                    brandAccent: '#9B59B6',
                  },
                },
              },
            }}
            providers={['discord']}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              ❧ "In the gentle guidance of structure, creativity finds its truest expression." ❧
            </p>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Aurelius Dashboard - IMVU Modeling Assistant</title>
        <meta name="description" content="Manage your IMVU modeling streams with Aurelius" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">◆</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aurelius</h1>
                <p className="text-sm text-gray-500">IMVU Modeling Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user.user_metadata?.full_name || user.email}
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
              { id: 'streams', name: 'Streams', icon: DocumentTextIcon },
              { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
              { id: 'reviews', name: 'Reviews', icon: StarIcon },
              { id: 'profile', name: 'Profile', icon: UserIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Active Streams', value: stats.activeStreams, color: 'blue', icon: ClockIcon },
                { label: 'Completed', value: stats.completedStreams, color: 'green', icon: CheckIcon },
                { label: 'Overdue', value: stats.overdueStreams, color: 'red', icon: ClockIcon },
                { label: 'This Week', value: stats.thisWeekStreams, color: 'purple', icon: CalendarIcon },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Streams */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Streams</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : streams.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No streams found. Create your first stream to get started!
                  </div>
                ) : (
                  streams.slice(0, 5).map((stream) => (
                    <div key={stream.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-medium text-gray-900">{stream.item_name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(stream.priority)}`}>
                              {stream.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stream.status)}`}>
                              {stream.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Creator: {stream.creator_name} • Agency: {stream.agency_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(stream.due_date)} ({getDaysUntilDue(stream.due_date)} days)
                          </p>
                        </div>
                        {stream.status === 'active' && (
                          <button
                            onClick={() => completeStream(stream.id)}
                            className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Streams</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Stream
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {streams.map((stream) => (
                      <tr key={stream.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stream.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stream.creator_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stream.agency_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(stream.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stream.status)}`}>
                            {stream.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(stream.priority)}`}>
                            {stream.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {stream.status === 'active' && (
                            <button
                              onClick={() => completeStream(stream.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder tabs */}
        {['schedule', 'reviews', 'profile', 'settings'].includes(activeTab) && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
            </h2>
            <p className="text-gray-500">
              This feature is currently under development. Check back soon!
            </p>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  )
}

export default Home
