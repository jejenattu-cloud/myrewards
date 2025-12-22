
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '../components/StatsCard';
import { MOCK_CAMPAIGNS } from '../constants';

interface DashboardProps {
  businessName: string;
}

const chartData = [
  { name: 'Mon', interactions: 850 },
  { name: 'Tue', interactions: 1240 },
  { name: 'Wed', interactions: 980 },
  { name: 'Thu', interactions: 1100 },
  { name: 'Fri', interactions: 700 },
  { name: 'Sat', interactions: 1450 },
  { name: 'Sun', interactions: 1240 },
];

const Dashboard: React.FC<DashboardProps> = ({ businessName }) => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Good Morning, {businessName}</h2>
          <p className="text-text-secondary dark:text-gray-400 text-lg">Here's what's happening with your notifications today.</p>
        </div>
        <button className="flex items-center gap-2 justify-center rounded-xl h-12 px-8 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Create Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Active Promos" value="3" change="+1 this week" icon="local_offer" />
        <StatsCard label="SMS Sent Today" value="145" change="+12%" icon="sms" />
        <StatsCard label="Open Rate" value="42%" change="+5%" icon="mark_email_read" />
        <StatsCard label="Revenue Attributed" value="$2,450" change="+8%" icon="attach_money" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col rounded-3xl bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 p-8 shadow-sm transition-colors">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="text-text-main dark:text-white text-xl font-bold">Weekly Engagement Trends</h3>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-4xl font-black dark:text-white">1,240</p>
                <div className="flex flex-col">
                  <span className="text-text-secondary dark:text-gray-400 text-sm font-medium">Interactions</span>
                  <span className="text-[#07880e] dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-400/10 px-2 py-0.5 rounded-full">+12% vs last week</span>
                </div>
              </div>
            </div>
            <select className="bg-background-light dark:bg-background-dark border-none dark:text-gray-300 text-sm rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary outline-none transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec6d13" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec6d13" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-white/5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9a6c4c', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#2a2018',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#ec6d13', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="#ec6d13" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorInter)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/20 dark:border-primary/10 p-8 flex flex-col gap-6 transition-colors">
            <h3 className="text-text-main dark:text-white text-xl font-bold">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Blast Flash Sale SMS', icon: 'bolt' },
                { label: 'Add New Customer', icon: 'person_add' },
                { label: 'Create New Coupon', icon: 'loyalty' }
              ].map((btn, i) => (
                <button key={i} className="flex items-center gap-4 bg-white dark:bg-[#2a2018] p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">{btn.icon}</span>
                  </div>
                  <span className="text-sm font-bold text-text-main dark:text-gray-200">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#2a2018] rounded-3xl border border-border-color dark:border-white/5 p-8 flex flex-col gap-6 flex-1 shadow-sm transition-colors">
            <h3 className="text-text-secondary dark:text-gray-500 text-sm font-bold uppercase tracking-widest">Recent Activity</h3>
            <div className="flex flex-col gap-6">
              {[
                { title: 'Weekend Brunch Promo ended', time: '2 hours ago', icon: 'check', color: 'green' },
                { title: 'New subscriber: Sarah J.', time: '4 hours ago', icon: 'person', color: 'blue' },
                { title: 'Flash Sale SMS sent to 500', time: 'Yesterday', icon: 'send', color: 'orange' }
              ].map((act, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className={`bg-${act.color}-100 dark:bg-${act.color}-400/10 text-${act.color}-700 dark:text-${act.color}-400 p-2 rounded-xl shrink-0`}>
                    <span className="material-symbols-outlined text-[20px]">{act.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main dark:text-gray-200">{act.title}</p>
                    <p className="text-xs text-text-secondary dark:text-gray-500 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black dark:text-white">Active Campaigns</h3>
          <button className="text-primary text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="bg-white dark:bg-[#2a2018] border border-border-color dark:border-white/5 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-border-color dark:border-white/10">
              <tr>
                <th className="p-6 text-xs font-bold text-text-secondary dark:text-gray-400 uppercase">Campaign Name</th>
                <th className="p-6 text-xs font-bold text-text-secondary dark:text-gray-400 uppercase">Channel</th>
                <th className="p-6 text-xs font-bold text-text-secondary dark:text-gray-400 uppercase">Status</th>
                <th className="p-6 text-xs font-bold text-text-secondary dark:text-gray-400 uppercase">Engagement</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-white/5">
              {MOCK_CAMPAIGNS.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={camp.image} className="size-12 rounded-xl object-cover shadow-sm" alt={camp.name} />
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main dark:text-gray-200">{camp.name}</span>
                        <span className="text-xs text-text-secondary dark:text-gray-500">{camp.ends}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="flex items-center gap-2 text-text-main dark:text-gray-300 text-sm font-medium">
                      <span className="material-symbols-outlined text-[18px]">
                        {camp.channel === 'SMS' ? 'sms' : camp.channel === 'Email' ? 'mail' : 'notifications'}
                      </span>
                      {camp.channel}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      camp.status === 'Active' ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400' : 
                      camp.status === 'Scheduled' ? 'bg-orange-100 dark:bg-orange-400/10 text-orange-700 dark:text-orange-400' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-400'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2 w-32">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary dark:text-gray-500 font-medium">Open Rate</span>
                        <span className="font-bold dark:text-gray-300">{camp.engagementRate}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${camp.engagementRate > 50 ? 'bg-green-500' : 'bg-primary'}`} 
                             style={{ width: `${camp.engagementRate || 0}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-gray-400 hover:text-primary">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
