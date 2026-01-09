import React from 'react';
import { Button } from '../common/Button';
import { RefreshCw } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import { syncSkills, syncTaskComplexity } from '../../services/calculationService';

export function SyncSkillsButton() {
  const { state, dispatch } = useStorage();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = () => {
    setSyncing(true);
    
    try {
      // Sync members with all skills in SkillMeta
      const syncedMembers = syncSkills(state.members, state.skillMeta);
      dispatch({ type: 'SET_MEMBERS', payload: syncedMembers });

      // Sync tasks with all skills in SkillMeta
      const syncedTasks = syncTaskComplexity(state.tasks, state.skillMeta);
      dispatch({ type: 'SET_TASKS', payload: syncedTasks });

      alert('Đã đồng bộ kỹ năng thành công!');
    } catch (error) {
      alert('Lỗi khi đồng bộ: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSync}
      disabled={syncing || state.skillMeta.length === 0}
    >
      <RefreshCw size={16} className="mr-2" />
      {syncing ? 'Đang đồng bộ...' : 'Sync Skills'}
    </Button>
  );
}
