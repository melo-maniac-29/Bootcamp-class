import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

export default function AdminOverview() {
  const stats = [
    { name: 'Total Participants', value: '0', icon: Users },
    { name: 'Active Programs', value: '0', icon: BookOpen },
    { name: 'Pending Reviews', value: '0', icon: Clock },
    { name: 'Completion Rate', value: '0%', icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Overview</h1>
        <p className="text-white/60">Welcome to the Circuitron admin command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-white/40" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for recent activity or charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/40 flex h-32 items-center justify-center border border-dashed border-white/10 rounded-lg">
              No recent submissions
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/40 flex h-32 items-center justify-center border border-dashed border-white/10 rounded-lg">
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
