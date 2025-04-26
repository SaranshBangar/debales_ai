import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const [animatedActivity, setAnimatedActivity] = useState<string | null>(null);
  const [prevActivities, setPrevActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (activities.length && JSON.stringify(activities) !== JSON.stringify(prevActivities)) {
      const newActivities = activities.filter((activity) => !prevActivities.find((prev) => prev.id === activity.id));

      if (newActivities.length > 0) {
        setAnimatedActivity(newActivities[0].id);

        const timer = setTimeout(() => {
          setAnimatedActivity(null);
        }, 5000);

        return () => clearTimeout(timer);
      }

      setPrevActivities(activities);
    }
  }, [activities, prevActivities]);

  if (!activities.length) {
    return <div className="text-center py-8 text-muted-foreground">No activities to display</div>;
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffSeconds = Math.floor((now.getTime() - activityTime.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={cn(
            "flex items-start space-x-3 p-3 rounded-lg transition-all",
            animatedActivity === activity.id && "bg-primary/10 animate-fade-in"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary">{activity.userId.slice(-2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">User {activity.userId}</p>
              <span className="text-xs text-muted-foreground">{getRelativeTime(activity.timestamp)}</span>
            </div>
            <p className="text-sm">{activity.action}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
