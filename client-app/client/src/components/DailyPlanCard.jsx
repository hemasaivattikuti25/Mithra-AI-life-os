/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DAILY PLAN CARD — AI-Powered Day Architect
 * 
 * Displays today's AI-generated schedule with:
 * - Time-blocked tasks
 * - Habit reminders
 * - Energy level selector
 * - Refresh capability
 * ═══════════════════════════════════════════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  RefreshCw,
  Zap,
  Battery,
  BatteryLow,
  Coffee,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { apiFetch } from '../services/firebaseClient';

const ENERGY_LEVELS = [
  { value: 'low', label: 'Low Energy', icon: BatteryLow, color: 'text-amber-500' },
  { value: 'medium', label: 'Medium', icon: Battery, color: 'text-blue-500' },
  { value: 'high', label: 'High Energy', icon: Zap, color: 'text-green-500' },
];

export default function DailyPlanCard({ className = '' }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [expanded, setExpanded] = useState(true);
  const [completedBlocks, setCompletedBlocks] = useState(new Set());

  // Load plan on mount
  useEffect(() => {
    fetchPlan(false);
  }, []);

  const fetchPlan = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiFetch('/plan/today', {
        method: 'POST',
        body: JSON.stringify({
          energy_level: energyLevel,
          force_refresh: forceRefresh,
        }),
      });
      
      if (data?.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('403') || msg.includes('limit')) {
        setError('Daily AI limit reached — resets tomorrow');
      } else if (msg.includes('500') || msg.includes('unavailable')) {
        setError('AI service temporarily unavailable');
      } else {
        setError('Could not load your daily plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPlan(true);
  };

  const handleEnergyChange = (level) => {
    setEnergyLevel(level);
    // Refresh with new energy level
    fetchPlan(true);
  };

  const toggleBlockComplete = (index) => {
    const newCompleted = new Set(completedBlocks);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedBlocks(newCompleted);
  };

  const getBlockTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'task':
        return <Circle className="w-4 h-4" />;
      case 'habit':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'break':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-slate-300 bg-slate-50 dark:bg-slate-800/50';
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Today's Plan
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI-powered daily schedule
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={loading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Regenerate plan"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Energy Level Selector */}
          <div className="flex gap-2 mb-4">
            {ENERGY_LEVELS.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => handleEnergyChange(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  energyLevel === value
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${energyLevel === value ? color : ''}`} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Creating your personalized plan...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-6">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Plan Content */}
          {plan && !loading && (
            <div className="space-y-3">
              {/* Summary */}
              {plan.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {plan.summary}
                </p>
              )}

              {/* Time Blocks */}
              {plan.blocks?.length > 0 ? (
                <div className="space-y-2">
                  {plan.blocks.map((block, index) => (
                    <div
                      key={index}
                      onClick={() => toggleBlockComplete(index)}
                      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all ${
                        completedBlocks.has(index)
                          ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500 opacity-60'
                          : getPriorityColor(block.priority)
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {completedBlocks.has(index) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          getBlockTypeIcon(block.type)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {block.time}
                          </span>
                          {block.duration && (
                            <span className="text-xs text-slate-400">
                              ({block.duration})
                            </span>
                          )}
                        </div>
                        <p className={`font-medium text-slate-900 dark:text-white ${
                          completedBlocks.has(index) ? 'line-through' : ''
                        }`}>
                          {block.title}
                        </p>
                        {block.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {block.notes}
                          </p>
                        )}
                      </div>

                      {block.priority === 'high' && !completedBlocks.has(index) && (
                        <span className="flex-shrink-0 text-red-500 text-xs font-medium">
                          🔴
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                  No time blocks yet. Add tasks to get a personalized plan!
                </p>
              )}

              {/* Daily Tip */}
              {plan.tip && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    💡 {plan.tip}
                  </p>
                </div>
              )}

              {/* Progress */}
              {plan.blocks?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>{completedBlocks.size}/{plan.blocks.length} completed</span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{
                        width: `${(completedBlocks.size / plan.blocks.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!plan && !loading && !error && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-3">
                No plan generated yet
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Generate My Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
