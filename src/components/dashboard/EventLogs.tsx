import { useState } from 'react';
import type { EventLog, AssetId } from '../../types/twin';
import { FileText, Download, Filter, Search } from 'lucide-react';

interface EventLogsProps {
  logs: EventLog[];
  currentAssetId: AssetId;
}

export function EventLogs({ logs, currentAssetId }: EventLogsProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (log.assetId !== currentAssetId) return false;
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        log.user.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Asset', 'User', 'Action', 'Details', 'Type'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.assetId,
      `"${l.user}"`,
      `"${l.action}"`,
      `"${l.details}"`,
      l.type
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digitaltwin_audit_log_${currentAssetId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold tracking-wider text-slate-200 font-mono uppercase flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Audit Log & Event Trail
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950 text-xs font-mono text-slate-200 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={exportCSV}
            className="px-2.5 py-1 bg-cyan-950 border border-cyan-800/80 hover:bg-cyan-900 text-cyan-400 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Log Type Filters */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-slate-500 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {['all', 'control', 'system', 'alarm', 'anomaly'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2 py-0.5 rounded capitalize ${
              filterType === t
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Log Entries */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
            No audit logs found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">[{log.timestamp}]</span>
                <span className="font-bold text-slate-200">{log.action}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-900">
                  {log.user}
                </span>
              </div>
              <span className="text-slate-400 text-[11px] truncate max-w-sm">{log.details}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
