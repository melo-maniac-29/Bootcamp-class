import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSubmissions() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Submissions & Reviews</h1>
        <p className="text-white/60">Review participant tasks and provide feedback.</p>
      </div>

      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/40 flex flex-col h-64 items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p>No pending submissions.</p>
            <p className="mt-1">When participants submit their daily tasks, they will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
