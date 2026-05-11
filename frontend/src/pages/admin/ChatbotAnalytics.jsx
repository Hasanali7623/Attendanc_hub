import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chatbotAPI } from "../../utils/apiService";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  Download,
  Filter,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

const ChatbotAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Try to fetch real analytics data from backend
      const response = await chatbotAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set empty/zero data instead of mock data
      setAnalytics({
        totalQueries: 0,
        activeUsers: 0,
        avgResponseTime: "0s",
        satisfactionRate: 0,
        resolvedQueries: 0,
        topQueries: [],
        dailyUsage: [],
        queryTypes: [],
        sentiment: [],
        recentConversations: [],
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Metric", "Value"];
    const data = [
      ["Total Queries", analytics.totalQueries],
      ["Active Users", analytics.activeUsers],
      ["Average Response Time", analytics.avgResponseTime],
      ["Satisfaction Rate", `${analytics.satisfactionRate}%`],
      ["Resolved Queries", analytics.resolvedQueries],
    ];

    const csv = [headers.join(","), ...data.map((row) => row.join(","))].join(
      "\n",
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatbot-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  if (!analytics) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Chatbot Analytics 🤖
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor AI chatbot performance and user interactions in real-time
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="shadow-md"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="shadow-md">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Total Queries</p>
          <h3 className="text-4xl font-bold">{analytics.totalQueries}</h3>
          <p className="text-white/70 text-xs mt-2">&nbsp;</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Active Users</p>
          <h3 className="text-4xl font-bold">{analytics.activeUsers}</h3>
          <p className="text-white/70 text-xs mt-2">&nbsp;</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Avg Response</p>
          <h3 className="text-4xl font-bold">{analytics.avgResponseTime}</h3>
          <p className="text-white/70 text-xs mt-2">&nbsp;</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <ThumbsUp className="w-8 h-8" />
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Satisfaction</p>
          <h3 className="text-4xl font-bold">{analytics.satisfactionRate}%</h3>
          <p className="text-white/70 text-xs mt-2">&nbsp;</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Resolved</p>
          <h3 className="text-4xl font-bold">{analytics.resolvedQueries}</h3>
          <p className="text-white/70 text-xs mt-2">
            {analytics.totalQueries > 0
              ? `${(
                  (analytics.resolvedQueries / analytics.totalQueries) *
                  100
                ).toFixed(1)}% resolution rate`
              : "\u00A0"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="📊 Query Trends"
          className="hover:shadow-xl transition-shadow duration-300"
        >
          {analytics.dailyUsage && analytics.dailyUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="queries"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", r: 5 }}
                  name="Total Queries"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No query data available</p>
                <p className="text-sm mt-1">
                  Data will appear as chatbot is used
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="🎯 Query Categories"
          className="hover:shadow-xl transition-shadow duration-300"
        >
          {analytics.queryTypes && analytics.queryTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.queryTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.queryTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No category data available</p>
                <p className="text-sm mt-1">
                  Query categories will appear here
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="🔥 Most Asked Questions"
          className="hover:shadow-xl transition-shadow duration-300"
        >
          {analytics.topQueries && analytics.topQueries.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topQueries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="query" type="category" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorGradient)"
                  radius={[0, 8, 8, 0]}
                />
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No question data available</p>
                <p className="text-sm mt-1">
                  Popular questions will appear here
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="😊 Sentiment Analysis"
          className="hover:shadow-xl transition-shadow duration-300"
        >
          {analytics.sentiment && analytics.sentiment.length > 0 ? (
            <div className="space-y-4 p-4">
              {analytics.sentiment.map((item, index) => {
                const icons = {
                  Positive: <Smile className="w-6 h-6 text-green-500" />,
                  Neutral: <Meh className="w-6 h-6 text-yellow-500" />,
                  Negative: <Frown className="w-6 h-6 text-red-500" />,
                };
                const colors = {
                  Positive: "bg-green-500",
                  Neutral: "bg-yellow-500",
                  Negative: "bg-red-500",
                };
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {icons[item.type]}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{item.count}</p>
                        <p className="text-xs text-gray-500">
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${
                          colors[item.type]
                        } h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Smile className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No sentiment data available</p>
                <p className="text-sm mt-1">
                  Sentiment analysis will appear here
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card
        title="💬 Recent Conversations"
        className="hover:shadow-xl transition-shadow duration-300"
      >
        <div className="space-y-3">
          {analytics.recentConversations &&
          analytics.recentConversations.length > 0 ? (
            analytics.recentConversations.map((conv, i) => {
              const sentimentIcons = {
                Positive: <Smile className="w-4 h-4 text-green-500" />,
                Neutral: <Meh className="w-4 h-4 text-yellow-500" />,
                Negative: <Frown className="w-4 h-4 text-red-500" />,
              };
              const sentimentColors = {
                Positive: "border-l-green-500",
                Neutral: "border-l-yellow-500",
                Negative: "border-l-red-500",
              };
              return (
                <div
                  key={i}
                  className={`p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-lg border-l-4 ${
                    sentimentColors[conv.sentiment]
                  } hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {conv.user.toString().slice(-2)}
                      </div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        User #{conv.user}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sentimentIcons[conv.sentiment]}
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
                    "{conv.query}"
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">
                Chatbot conversations will appear here
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatbotAnalytics;
