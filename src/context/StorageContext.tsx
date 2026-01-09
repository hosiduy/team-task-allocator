import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, StorageAction, Member, Task, ConfigRule, SkillMeta } from '../types';
import { STORAGE_KEYS } from '../types';

const initialState: AppState = {
  members: [],
  tasks: [],
  configRules: [],
  skillMeta: []
};

function storageReducer(state: AppState, action: StorageAction): AppState {
  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    
    case 'SET_MEMBERS':
      return { ...state, members: action.payload };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(m => m.id === action.payload.id ? action.payload : m)
      };
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter(m => m.id !== action.payload)
      };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      };
    
    case 'SET_CONFIG_RULES':
      return { ...state, configRules: action.payload };
    case 'ADD_CONFIG_RULE':
      return { ...state, configRules: [...state.configRules, action.payload] };
    case 'UPDATE_CONFIG_RULE':
      return {
        ...state,
        configRules: state.configRules.map(r => r.levelId === action.payload.levelId ? action.payload : r)
      };
    case 'DELETE_CONFIG_RULE':
      return {
        ...state,
        configRules: state.configRules.filter(r => r.levelId !== action.payload)
      };
    
    case 'SET_SKILL_META':
      return { ...state, skillMeta: action.payload };
    case 'ADD_SKILL_META':
      return { ...state, skillMeta: [...state.skillMeta, action.payload] };
    case 'UPDATE_SKILL_META':
      return {
        ...state,
        skillMeta: state.skillMeta.map(s => s.id === action.payload.id ? action.payload : s)
      };
    case 'DELETE_SKILL_META':
      return {
        ...state,
        skillMeta: state.skillMeta.filter(s => s.id !== action.payload)
      };
    
    default:
      return state;
  }
}

interface StorageContextType {
  state: AppState;
  dispatch: React.Dispatch<StorageAction>;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  exportAll: () => string;
  exportToCSV: (type: 'members' | 'tasks' | 'config-rules') => string;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storageReducer, initialState);

  const loadFromStorage = useCallback(() => {
    try {
      const members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS) || '[]');
      const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      const configRules = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG_RULES) || '[]');
      const skillMeta = JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILL_META) || '[]');
      
      dispatch({
        type: 'LOAD_FROM_STORAGE',
        payload: { members, tasks, configRules, skillMeta }
      });
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }, []);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(state.members));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
      localStorage.setItem(STORAGE_KEYS.CONFIG_RULES, JSON.stringify(state.configRules));
      localStorage.setItem(STORAGE_KEYS.SKILL_META, JSON.stringify(state.skillMeta));
    } catch (error) {
      console.error('Failed to save to storage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('Bộ nhớ đầy. Vui lòng xóa bớt dữ liệu.');
      }
    }
  }, [state]);

  const exportAll = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const exportToCSV = useCallback((type: 'members' | 'tasks' | 'config-rules') => {
    if (type === 'members') {
      const headers = ['Member Name', 'Current Level', 'Last Review Date'];
      state.skillMeta.forEach(skill => headers.push(skill.name));
      
      const rows = state.members.map(member => {
        const row = [member.name, member.currentLevel, member.lastReviewDate];
        state.skillMeta.forEach(skill => {
          row.push(String(member.skills[skill.id] || 0));
        });
        return row;
      });
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else if (type === 'tasks') {
      const headers = ['Task/Feature', 'Link'];
      state.skillMeta.forEach(skill => headers.push(skill.name));
      headers.push('Final SP', 'Assignee');
      
      const rows = state.tasks.map(task => {
        const row = [task.name, task.link];
        state.skillMeta.forEach(skill => {
          row.push(String(task.complexity[skill.id] || 0));
        });
        row.push(String(task.finalSP), task.assignee);
        return row;
      });
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['Level ID', 'Level Name', 'Max SP Self', 'Review Authority'];
      const rows = state.configRules.map(rule => [
        String(rule.levelId),
        rule.levelName,
        String(rule.maxSPSelf),
        String(rule.reviewAuthority)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }, [state]);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Save to storage whenever state changes
  useEffect(() => {
    if (state.members.length > 0 || state.tasks.length > 0 || state.configRules.length > 0 || state.skillMeta.length > 0) {
      saveToStorage();
    }
  }, [state, saveToStorage]);

  return (
    <StorageContext.Provider value={{ state, dispatch, loadFromStorage, saveToStorage, exportAll, exportToCSV }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
}
