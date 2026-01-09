import { useStorage } from '../../context/StorageContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { Member } from '../../types';

interface SkillRadarChartProps {
  member: Member;
}

export function SkillRadarChart({ member }: SkillRadarChartProps) {
  const { state } = useStorage();

  // Prepare data for radar chart
  const chartData = state.skillMeta.map(skill => ({
    skill: skill.shortName,
    value: member.skills[skill.id] || 0,
    fullMark: 5
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Chưa có dữ liệu kỹ năng
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 5]} />
        <Radar
          name={member.name}
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
