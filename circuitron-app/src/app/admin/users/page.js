import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function AdminUsers() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">User Management</h1>
          <p className="text-white/60">Create and manage participants across all batches.</p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90">
          <UserPlus className="mr-2 h-4 w-4" /> Add Participant
        </Button>
      </div>

      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle>Participants List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/40 flex flex-col h-64 items-center justify-center border border-dashed border-white/10 rounded-lg">
            <p>No participants found.</p>
            <p className="mt-1">Click "Add Participant" to create the first user.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
