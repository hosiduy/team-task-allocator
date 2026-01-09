import React, { useState } from 'react';
import { FileDropzone } from '../common/FileDropzone';
import { Button } from '../common/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import {
  parseConfigRules,
  parseMemberProfiles,
  parseTaskAllocation,
  createSkillMeta
} from '../../services/csvService';
import { syncSkills, syncTaskComplexity } from '../../services/calculationService';
import type { CSVImportError } from '../../types';

type ImportType = 'members' | 'tasks' | 'config-rules';

export function ImportSection() {
  const { state, dispatch } = useStorage();
  const [importType, setImportType] = useState<ImportType>('members');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    errors?: CSVImportError[];
    newSkills?: string[];
  } | null>(null);

  const handleFileSelect = async (file: File) => {
    setImporting(true);
    setImportStatus(null);

    try {
      const content = await file.text();

      if (importType === 'config-rules') {
        const result = parseConfigRules(content);
        
        if (result.success) {
          dispatch({ type: 'SET_CONFIG_RULES', payload: result.data });
          setImportStatus({
            success: true,
            message: `Đã import thành công ${result.data.length} quy tắc cấu hình`
          });
        } else {
          setImportStatus({
            success: false,
            message: 'Import thất bại',
            errors: result.errors
          });
        }
      } else if (importType === 'members') {
        const result = parseMemberProfiles(content, state.skillMeta);
        
        if (result.newSkillsDetected && result.newSkillsDetected.length > 0) {
          // Prompt user about new skills
          const confirmed = window.confirm(
            `Phát hiện ${result.newSkillsDetected.length} kỹ năng mới:\n${result.newSkillsDetected.join(', ')}\n\nBạn có muốn thêm các kỹ năng này vào hệ thống không?`
          );
          
          if (confirmed) {
            // Add new skills to SkillMeta
            const newSkills = result.newSkillsDetected.map(createSkillMeta);
            const updatedSkillMeta = [...state.skillMeta, ...newSkills];
            dispatch({ type: 'SET_SKILL_META', payload: updatedSkillMeta });
            
            // Re-parse with updated skills
            const reResult = parseMemberProfiles(content, updatedSkillMeta);
            
            if (reResult.success) {
              // Sync existing members with new skills
              const syncedMembers = syncSkills(state.members, updatedSkillMeta);
              const allMembers = [...syncedMembers, ...reResult.data];
              dispatch({ type: 'SET_MEMBERS', payload: allMembers });
              
              // Sync tasks with new skills
              const syncedTasks = syncTaskComplexity(state.tasks, updatedSkillMeta);
              dispatch({ type: 'SET_TASKS', payload: syncedTasks });
              
              setImportStatus({
                success: true,
                message: `Đã import thành công ${reResult.data.length} thành viên và ${newSkills.length} kỹ năng mới`
              });
            }
          }
        } else if (result.success) {
          const allMembers = [...state.members, ...result.data];
          dispatch({ type: 'SET_MEMBERS', payload: allMembers });
          setImportStatus({
            success: true,
            message: `Đã import thành công ${result.data.length} thành viên`
          });
        } else {
          setImportStatus({
            success: false,
            message: 'Import thất bại',
            errors: result.errors
          });
        }
      } else if (importType === 'tasks') {
        const result = parseTaskAllocation(content, state.skillMeta);
        
        if (result.newSkillsDetected && result.newSkillsDetected.length > 0) {
          // Prompt user about new skills
          const confirmed = window.confirm(
            `Phát hiện ${result.newSkillsDetected.length} kỹ năng mới:\n${result.newSkillsDetected.join(', ')}\n\nBạn có muốn thêm các kỹ năng này vào hệ thống không?`
          );
          
          if (confirmed) {
            // Add new skills to SkillMeta
            const newSkills = result.newSkillsDetected.map(createSkillMeta);
            const updatedSkillMeta = [...state.skillMeta, ...newSkills];
            dispatch({ type: 'SET_SKILL_META', payload: updatedSkillMeta });
            
            // Re-parse with updated skills
            const reResult = parseTaskAllocation(content, updatedSkillMeta);
            
            if (reResult.success) {
              // Sync existing members with new skills
              const syncedMembers = syncSkills(state.members, updatedSkillMeta);
              dispatch({ type: 'SET_MEMBERS', payload: syncedMembers });
              
              // Sync existing tasks with new skills
              const syncedTasks = syncTaskComplexity(state.tasks, updatedSkillMeta);
              const allTasks = [...syncedTasks, ...reResult.data];
              dispatch({ type: 'SET_TASKS', payload: allTasks });
              
              setImportStatus({
                success: true,
                message: `Đã import thành công ${reResult.data.length} công việc và ${newSkills.length} kỹ năng mới`
              });
            }
          }
        } else if (result.success) {
          const allTasks = [...state.tasks, ...result.data];
          dispatch({ type: 'SET_TASKS', payload: allTasks });
          setImportStatus({
            success: true,
            message: `Đã import thành công ${result.data.length} công việc`
          });
        } else {
          setImportStatus({
            success: false,
            message: 'Import thất bại',
            errors: result.errors
          });
        }
      }
    } catch (error) {
      setImportStatus({
        success: false,
        message: `Lỗi khi đọc file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Dữ Liệu</h2>
        
        {/* Import Type Selection */}
        <div className="flex gap-3 mb-6">
          <Button
            variant={importType === 'members' ? 'primary' : 'secondary'}
            onClick={() => setImportType('members')}
            size="sm"
          >
            Thành viên
          </Button>
          <Button
            variant={importType === 'tasks' ? 'primary' : 'secondary'}
            onClick={() => setImportType('tasks')}
            size="sm"
          >
            Công việc
          </Button>
          <Button
            variant={importType === 'config-rules' ? 'primary' : 'secondary'}
            onClick={() => setImportType('config-rules')}
            size="sm"
          >
            Quy tắc
          </Button>
        </div>

        {/* File Upload */}
        <FileDropzone
          onFileSelect={handleFileSelect}
          label={
            importType === 'members'
              ? 'Import file member_profile.csv'
              : importType === 'tasks'
              ? 'Import file task_allocation.csv'
              : 'Import file config_rules.csv'
          }
        />

        {/* Import Status */}
        {importing && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">Đang xử lý...</p>
          </div>
        )}

        {importStatus && (
          <div className={`mt-4 p-4 rounded-lg ${importStatus.success ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <div className="flex items-start gap-3">
              {importStatus.success ? (
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
              ) : (
                <AlertCircle className="text-rose-600 flex-shrink-0" size={20} />
              )}
              <div className="flex-1">
                <p className={`font-medium ${importStatus.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {importStatus.message}
                </p>
                {importStatus.errors && importStatus.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {importStatus.errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-rose-600">
                        Dòng {error.row} - {error.column}: {error.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
