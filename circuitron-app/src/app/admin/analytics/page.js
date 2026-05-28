import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Analytics</h1>
        <p className="text-white/60">View detailed participant progress and platform metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/40 flex h-64 items-center justify-center border border-dashed border-white/10 rounded-lg">
              [Chart Placeholder]
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-white/10 text-white shadow-none">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-white/40 flex h-64 items-center justify-center border border-dashed border-white/10 rounded-lg">
              [Leaderboard Placeholder]
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
