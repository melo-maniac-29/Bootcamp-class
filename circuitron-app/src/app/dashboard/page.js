import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, Clock, CalendarDays } from 'lucide-react';

export default function DashboardOverview() {
  const stats = [
    { name: 'Active Streak', value: '3 Days', icon: Zap },
    { name: 'Completed Days', value: '4', icon: CheckCircleIcon },
    { name: 'Next Unlock', value: 'Tomorrow, 9 AM', icon: Clock },
    { name: 'Overall Progress', value: '15%', icon: Target },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome Back</h1>
        <p className="text-white/60">Here is your learning summary and upcoming tasks.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader>
              <CardTitle>Up Next: Day 5 - Advanced Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-6">Dive deep into advanced circuit design and master component behavior.</p>
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
                Start Learning
              </button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-[#121214] border-white/10 text-white shadow-none">
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-white/40 flex h-32 items-center justify-center border border-dashed border-white/10 rounded-lg">
                No new announcements
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
