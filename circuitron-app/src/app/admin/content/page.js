import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminContentCMS() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Content CMS</h1>
          <p className="text-white/60">Manage Programs, Batches, Modules, and Days.</p>
        </div>
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="mr-2 h-4 w-4" /> Create Program
        </Button>
      </div>

      <Card className="bg-[#121214] border-white/10 text-white shadow-none">
        <CardHeader>
          <CardTitle>Programs Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/40 flex flex-col h-64 items-center justify-center border border-dashed border-white/10 rounded-lg">
            <FolderTreeIcon className="h-8 w-8 mb-4 opacity-50" />
            <p>No programs created yet.</p>
            <p className="mt-1">Click "Create Program" to start building your curriculum.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FolderTreeIcon(props) {
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
      <path d="M4 20h4l1.5-2h8.5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5.3a2 2 0 0 1-1.4-.6L10 4H6a2 2 0 0 0-2 2v14Z" />
      <path d="M14 14h4" />
      <path d="M14 10h4" />
      <path d="M4 14h4" />
    </svg>
  );
}
