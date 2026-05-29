"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DayEditor from "./DayEditor";

export default function ContentPage() {
  const weeks = useQuery(api.content.getWeeks) || [];
  const createWeek = useMutation(api.content.createWeek);
  const createDay = useMutation(api.content.createDay);

  const [newWeekTitle, setNewWeekTitle] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [editingDayId, setEditingDayId] = useState(null);
  
  const days = useQuery(api.content.getDays, { weekId: selectedWeek === null ? undefined : selectedWeek }) || [];
  const deleteWeek = useMutation(api.content.deleteWeek);

  const handleCreateWeek = async (e) => {
    e.preventDefault();
    if (!newWeekTitle) return;
    await createWeek({
      title: newWeekTitle,
      status: "active",
      order: weeks.length + 1
    });
    setNewWeekTitle("");
  };

  const handleCreateDay = async () => {
    if (!selectedWeek) return;
    await createDay({
      weekId: selectedWeek,
      title: "New Day",
      order: days.length + 1,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Weeks Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Manage Weeks</h2>
        <div className="bg-[#121214] rounded-2xl border border-white/10 p-6 mb-6">
          <form onSubmit={handleCreateWeek} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newWeekTitle}
              onChange={(e) => setNewWeekTitle(e.target.value)}
              placeholder="Week Title (e.g., Week 1)" 
              className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-2 outline-none focus:border-white transition-colors"
            />
            <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 flex items-center gap-2">
              <Plus size={18} /> Add
            </button>
          </form>

          <div className="space-y-2">
            {weeks.map((week) => (
              <div 
                key={week._id} 
                className={`p-4 rounded-xl border transition-all flex justify-between items-center group ${
                  selectedWeek === week._id 
                    ? "bg-white/10 border-white/30" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="cursor-pointer flex-1" onClick={() => setSelectedWeek(week._id)}>
                  <div className="font-semibold">{week.title}</div>
                  <div className="text-xs text-white/50">Order: {week.order} • Status: {week.status}</div>
                </div>
                <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to delete this week?")) {
                      deleteWeek({ weekId: week._id });
                      if(selectedWeek === week._id) setSelectedWeek(null);
                    }
                  }} 
                  className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {weeks.length === 0 && <div className="text-white/50 text-sm">No weeks found. Create one above.</div>}
          </div>
        </div>
      </div>

      {/* Days Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Manage Days</h2>
        {!selectedWeek ? (
          <div className="p-8 border border-dashed border-white/20 rounded-2xl text-center text-white/50">
            Select a week to manage its days.
          </div>
        ) : editingDayId ? (
          <DayEditor dayId={editingDayId} onClose={() => setEditingDayId(null)} />
        ) : (
          <div className="bg-[#121214] rounded-2xl border border-white/10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Days for Selected Week</h3>
              <button 
                onClick={handleCreateDay}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Add Day
              </button>
            </div>

            <div className="space-y-2">
              {days.map((day) => (
                <div key={day._id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group">
                  <div>
                    <div className="font-medium">{day.title}</div>
                    <div className="text-xs text-white/50">Order: {day.order}</div>
                  </div>
                  <button 
                    onClick={() => setEditingDayId(day._id)} 
                    className="text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Edit Day & Tasks
                  </button>
                </div>
              ))}
              {days.length === 0 && <div className="text-white/50 text-sm">No days in this week yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
