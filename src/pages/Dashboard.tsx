import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/contexts/socket-context";
import { BarChart3, Clock, Users } from "lucide-react";
import { CircleUserIcon } from "lucide-react";
import ActiveUsersChart from "@/components/dashboard/active-users-chart";
import ActivityMetricsChart from "@/components/dashboard/activity-metrics-chart";
import LiveUserCounter from "@/components/dashboard/live-user-counter";
import ActivityFeed from "@/components/dashboard/activity-feed";

const Dashboard = () => {
  const { lastMessage } = useSocket();

  useEffect(() => {
    document.title = "Analytics Dashboard";
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time analytics and insights for your platform.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Live Users</CardTitle>
              <CircleUserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <LiveUserCounter value={lastMessage?.data?.liveUserCount || 0} />
              <p className="text-xs text-muted-foreground">Connected users right now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,845</div>
              <p className="text-xs text-muted-foreground">+10.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3m 12s</div>
              <p className="text-xs text-muted-foreground">-2.5% from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>User count over the past 24 hours</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ActiveUsersChart data={lastMessage?.data?.activeUsers || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Metrics</CardTitle>
                  <CardDescription>User actions by category</CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ActivityMetricsChart data={lastMessage?.data?.activityCategories || []} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Real-time user actions on your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={lastMessage?.data?.recentActivities || []} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
