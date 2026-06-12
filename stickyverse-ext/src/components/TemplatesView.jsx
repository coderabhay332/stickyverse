import React, { useState } from 'react';
import { useAppContext } from '../App';
import { generateUUID } from '../utils/uuid';

const TEMPLATES = [
  // Work Templates
  { id: 'daily_plan', title: '☀️ Daily Plan', em: '☀️', desc: 'Focus, tasks, meetings, and goals', category: 'Work' },
  { id: 'weekly_review', title: '📅 Weekly Review', em: '📅', desc: 'Wins, failures, lessons, and metrics', category: 'Work' },
  { id: 'monthly_review', title: '📅 Monthly Review', em: '📅', desc: 'Monthly metrics, wins, and next focus', category: 'Work' },
  { id: 'meeting_notes', title: '🎙️ Meeting Notes', em: '🎙️', desc: 'Agenda, key points, and action items', category: 'Work' },
  { id: 'one_on_one', title: '👥 1 on 1 Meeting', em: '👥', desc: 'Collaborative feedback and action items', category: 'Work' },
  { id: 'client_brief', title: '💼 Client Brief', em: '💼', desc: 'Goals, deadlines, budget, and deliverables', category: 'Work' },
  { id: 'status_update', title: '📊 Status Update', em: '📊', desc: 'Reporting progress, blockers, and next steps', category: 'Work' },
  { id: 'okrs', title: '🎯 OKRs', em: '🎯', desc: 'Objective setting and key results', category: 'Work' },

  // Personal Templates
  { id: 'brain_dump', title: '⚡ Brain Dump', em: '⚡', desc: 'Declutter, prioritize, and capture actions', category: 'Personal' },
  { id: 'morning_routine', title: '🌅 Morning Routine', em: '🌅', desc: 'Gratitude, intentions, and top tasks', category: 'Personal' },
  { id: 'evening_reflection', title: '🌙 Evening Reflection', em: '🌙', desc: 'Daily achievements, learnings, and energy', category: 'Personal' },
  { id: 'weekly_goals', title: '🎯 Weekly Goals', em: '🎯', desc: 'Work, health, personal, and learning goals', category: 'Personal' },
  { id: 'reading_list', title: '📚 Reading List', em: '📚', desc: 'Track reading progress and best takeaways', category: 'Personal' },
  { id: 'workout_plan', title: '💪 Workout Plan', em: '💪', desc: 'Daily exercises, goals, and metrics tracking', category: 'Personal' },

  // Creator Templates
  { id: 'content_idea', title: '💡 Content Idea', em: '💡', desc: 'Hooks, main points, CTA, and post status', category: 'Creator' },
  { id: 'twitter_thread', title: '🐦 Twitter Thread', em: '🐦', desc: 'Draft hooks, sequentially, and CTA tweet', category: 'Creator' },
  { id: 'blog_outline', title: '✍️ Blog Post Outline', em: '✍️', desc: 'Outlines, keywords, and links tracking', category: 'Creator' },

  // Founder Templates
  { id: 'idea_validation', title: '🚀 Idea Validation', em: '🚀', desc: 'Solve problem, target users, and test plans', category: 'Founder' },
  { id: 'launch_plan', title: '🏁 Launch Plan', em: '🏁', desc: 'Pre-launch timeline and launch day tasks', category: 'Founder' },
  { id: 'user_interview', title: '👤 User Interview Notes', em: '👤', desc: 'User background, pain points, and insights', category: 'Founder' },

  // Quick Notes Templates
  { id: 'questions', title: '❓ Questions to Answer', em: '❓', desc: 'Open questions, deadlines, and urgency', category: 'Quick Notes' },
  { id: 'idea_parking', title: '🧠 Idea Parking Lot', em: '🧠', desc: 'Capture raw thoughts to revisit later', category: 'Quick Notes' },
];

const TEMPLATES_MAP = {
  daily_plan: {
    title: '☀️ Daily Plan',
    content: "Today's Focus:\n\nTop 3 tasks:\n→ \n→ \n→ \n\nMeetings today:\n\n\nEnd of day goal:",
    color: 'yellow',
    tag: 'task',
    priority: 'high'
  },
  weekly_review: {
    title: '📅 Weekly Review',
    content: "Week of:\n\nWhat went well:\n→ \n→ \n\nWhat didn't go well:\n→ \n→ \n\nBiggest lesson this week:\n\nDidn't finish — carry forward:\n→ \n\nNext week's priority:",
    color: 'purple',
    tag: 'note',
    priority: 'none'
  },
  monthly_review: {
    title: '📅 Monthly Review',
    content: "Month:\n\nTop 3 wins:\n→ \n\nTop 3 failures and lessons:\n→ \n→ \n→ \n\nRevenue / key metric:\n\nHabits kept:\n\nHabits broken:\n\nFocus for next month:",
    color: 'blue',
    tag: 'note',
    priority: 'none'
  },
  meeting_notes: {
    title: '🎙️ Meeting Notes',
    content: "Meeting with:\nDate:\nTime:\n\nAgenda:\n→ \n→ \n\nKey points discussed:\n→ \n→ \n\nDecisions made:\n→ \n\nAction items:\n→ (owner)\n→ (owner)\n\nNext meeting:",
    color: 'purple',
    tag: 'task',
    priority: 'medium'
  },
  one_on_one: {
    title: '👥 1 on 1 Meeting',
    content: "Meeting with:\nDate:\n\nTheir updates:\n→ \n→ \n\nMy updates:\n→ \n→ \n\nChallenges they raised:\n\nFeedback I want to give:\n\nAction items:\n→ \n→ \n\nFollow up date:",
    color: 'purple',
    tag: 'note',
    priority: 'none'
  },
  client_brief: {
    title: '💼 Client Brief',
    content: "Client name:\nProject:\nDate:\n\nWhat they want:\n\nWhat they don't want:\n\nDeadline:\n\nBudget:\n\nDeliverables:\n→ \n→ \n\nSuccess looks like:\n\nNext step:",
    color: 'pink',
    tag: 'task',
    priority: 'high'
  },
  status_update: {
    title: '📊 Status Update',
    content: "Project:\nDate:\nReporting to:\n\nProgress this week:\n→ \n→ \n\nWhat's blocked:\n→ \n\nWhat's next:\n→ \n→ \n\nRisks:\n\nOverall status: On Track / At Risk / Behind",
    color: 'green',
    tag: 'task',
    priority: 'medium'
  },
  okrs: {
    title: '🎯 OKRs',
    content: "Quarter:\n\nObjective 1:\nKR1:\nKR2:\nKR3:\n\nObjective 2:\nKR1:\nKR2:\nKR3:\n\nObjective 3:\nKR1:\nKR2:\nKR3:\n\nEnd of quarter reflection:",
    color: 'blue',
    tag: 'task',
    priority: 'high'
  },
  brain_dump: {
    title: '⚡ Brain Dump',
    content: "Date:\nEverything on my mind right now:\n→ \n→ \n→ \n→ \n→ \n\nMost important from above:\n\nWhat I can ignore:\n\nWhat I need to act on today:",
    color: 'orange',
    tag: 'note',
    priority: 'none'
  },
  morning_routine: {
    title: '🌅 Morning Routine',
    content: "Today is:\n\nGratitude — 1 thing I am thankful for:\n\nHow I am feeling:\n\nToday's focus:\n\nTop 3 tasks:\n→ \n→ \n→ \n\nWho do I need to reach out to:\n\nIntention for today:",
    color: 'yellow',
    tag: 'note',
    priority: 'none'
  },
  evening_reflection: {
    title: '🌙 Evening Reflection',
    content: "Date:\n\nWhat I accomplished today:\n→ \n→ \n\nWhat I didn't finish:\n→ \n\nOne thing I learned:\n\nOne thing I am proud of:\n\nEnergy level today: /10\n\nTomorrow's priority:",
    color: 'cream',
    tag: 'note',
    priority: 'none'
  },
  weekly_goals: {
    title: '🎯 Weekly Goals',
    content: "Week of:\n\nWork goal:\n\nHealth goal:\n\nPersonal goal:\n\nLearning goal:\n\nOne thing I will NOT do this week:\n\nHow I will know it was a good week:",
    color: 'green',
    tag: 'task',
    priority: 'none'
  },
  reading_list: {
    title: '📚 Reading List',
    content: "Currently reading:\n→ Title:\n→ Author:\n→ % done:\n→ Key idea so far:\n\nWant to read next:\n→ \n→ \n→ \n\nFinished recently:\n→ Title:\n→ Best takeaway:",
    color: 'pink',
    tag: 'note',
    priority: 'none'
  },
  workout_plan: {
    title: '💪 Workout Plan',
    content: "Week of:\n\nMonday:\nTuesday:\nWednesday:\nThursday:\nFriday:\nSaturday:\nSunday:\n\nThis week's goal:\n\nCurrent weight / metric:\n\nNotes:",
    color: 'blue',
    tag: 'task',
    priority: 'none'
  },
  content_idea: {
    title: '💡 Content Idea',
    content: "Platform:\nContent type:\n\nHook:\n\nMain point:\n\nSupporting points:\n→ \n→ \n\nCall to action:\n\nBest time to post:\n\nStatus: Idea / Scripted / Recorded / Posted",
    color: 'yellow',
    tag: 'idea',
    priority: 'none'
  },
  twitter_thread: {
    title: '🐦 Twitter Thread',
    content: "Topic:\nGoal of this thread:\n\nTweet 1 (Hook):\n\nTweet 2:\n\nTweet 3:\n\nTweet 4:\n\nTweet 5:\n\nFinal tweet (CTA):\n\nPosted on:",
    color: 'blue',
    tag: 'idea',
    priority: 'none'
  },
  blog_outline: {
    title: '✍️ Blog Post Outline',
    content: "Title:\nTarget keyword:\nTarget reader:\n\nIntro hook:\n\nSection 1:\n→ \n\nSection 2:\n→ \n\nSection 3:\n→ \n\nConclusion and CTA:\n\nInternal links to add:\n→ \n\nStatus: Outline / Draft / Review / Published",
    color: 'purple',
    tag: 'note',
    priority: 'none'
  },
  idea_validation: {
    title: '🚀 Idea Validation',
    content: "Idea:\n\nProblem it solves:\n\nWho has this problem:\n\nHow they solve it today:\n\nWhy my solution is better:\n\nHow to test in one week:\n\nSuccess metric:\n\nKill condition (when to stop):",
    color: 'orange',
    tag: 'idea',
    priority: 'medium'
  },
  launch_plan: {
    title: '🏁 Launch Plan',
    content: "Product:\nLaunch date:\n\nTarget audience:\n\nLaunch channels:\n→ \n→ \n\nPre-launch tasks:\n→ \n→ \n\nLaunch day tasks:\n→ \n→ \n\nPost-launch tasks:\n→ \n→ \n\nGoal for launch day:\n\nSuccess metric:",
    color: 'green',
    tag: 'task',
    priority: 'high'
  },
  user_interview: {
    title: '👤 User Interview Notes',
    content: "Interviewee:\nDate:\nChannel:\n\nBackground:\n\nKey questions asked:\n→ \n→ \n→ \n\nWhat they said (exact words):\n→ \n→ \n\nPain points identified:\n→ \n→ \n\nSurprising insight:\n\nHow this changes my thinking:",
    color: 'purple',
    tag: 'note',
    priority: 'none'
  },
  questions: {
    title: '❓ Questions to Answer',
    content: "Date:\n\nQuestions I need to answer:\n→ \n→ \n→ \n→ \n\nMost urgent question:\n\nWho can help me answer these:\n\nDeadline to resolve:",
    color: 'pink',
    tag: 'note',
    priority: 'medium'
  },
  idea_parking: {
    title: '🧠 Idea Parking Lot',
    content: "Date:\n\nIdeas I don't want to lose:\n→ \n→ \n→ \n→ \n→ \n\nBest idea from above:\n\nWhy it might work:\n\nWhen to revisit:",
    color: 'cream',
    tag: 'idea',
    priority: 'none'
  }
};

const COLOR_MAP = {
  purple: '#EDE9FE',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  yellow: '#FEF9C3',
  pink: '#FCE7F3',
  orange: '#FFEDD5',
  cream: '#FFFBEB',
  dark: '#1E1B4B'
};

export function TemplatesView() {
  const { setNotes, setView, user, supabase } = useAppContext();
  const [previewId, setPreviewId] = useState(null);

  const handleCreateFromTemplate = async (type) => {
    const template = TEMPLATES_MAP[type];
    if (template) {
      const newNote = {
        id: generateUUID(),
        title: template.title,
        content: template.content,
        color: template.color,
        tag: template.tag,
        priority: template.priority || 'none',
        status: 'none',
        pinned: false,
        starred: false,
        archived: false,
        created: Date.now(),
        updated: Date.now()
      };

      setNotes(prev => [{ ...newNote, synced: false }, ...prev]);

      if (user && supabase) {
        const row = {
          id: newNote.id,
          user_id: user.id,
          title: newNote.title || null,
          content: newNote.content,
          type: newNote.tag === 'checklist' ? 'checklist' : newNote.tag === 'quote' ? 'quote' : 'note',
          style: newNote.tag === 'quote' ? 'polaroid' : 'regular',
          color: ['purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark'].includes(newNote.color) ? newNote.color : 'purple',
          tag: newNote.tag || 'note',
          status: newNote.status || 'none',
          priority: ['low', 'medium', 'high', 'urgent'].includes(newNote.priority) ? newNote.priority : 'medium',
          pinned: !!newNote.pinned,
          starred: !!newNote.starred,
          archived: !!newNote.archived,
          items: {
            realPriority: newNote.priority || 'none'
          },
          created_at: new Date(newNote.created).toISOString(),
          updated_at: new Date(newNote.updated).toISOString(),
        };
        try {
          const { error } = await supabase.from('notes').insert(row);
          if (error) {
            console.error('Failed to sync template note:', error.message);
          } else {
            setNotes(prev => prev.map(n => n.id === newNote.id ? { ...n, synced: true } : n));
          }
        } catch (e) {
          console.error('Failed to sync template note:', e.message);
        }
      }
      
      setPreviewId(null);
      setView('home');
    }
  };

  const previewTemplate = TEMPLATES_MAP[previewId];

  return (
    <div style={{ maxWidth: 900, position: 'relative' }}>
      <div className="view-head">
        <h2 className="view-title">📝 Templates</h2>
        <p className="view-sub">Quick-start templates for common tasks and productivity structures</p>
      </div>

      {['Work', 'Personal', 'Creator', 'Founder', 'Quick Notes'].map(cat => {
        const catTemplates = TEMPLATES.filter(t => t.category === cat);
        return (
          <div key={cat} style={{ marginTop: '28px' }}>
            <h3 style={{ fontSize: '13px', fontFamily: 'Geist Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
              {cat} Templates
            </h3>
            <div className="templates-grid">
              {catTemplates.map(t => (
                <div
                  key={t.id}
                  className="template-card"
                  onClick={() => setPreviewId(t.id)}
                >
                  <div className="template-icon">{t.em}</div>
                  <div className="template-title">{t.title}</div>
                  <div className="template-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      {previewId && previewTemplate && (
        <div className="modal-overlay" onClick={() => setPreviewId(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h2>📋 Template Preview</h2>
              <button className="modal-close" onClick={() => setPreviewId(null)}>×</button>
            </div>
            
            <div style={{ margin: '16px 0' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontFamily: 'Geist Mono, monospace', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                Previewing: {previewTemplate.title}
              </div>
              <div style={{ 
                background: COLOR_MAP[previewTemplate.color] || '#EDE9FE', 
                color: previewTemplate.color === 'dark' ? '#ede9fe' : '#2a2050',
                padding: '16px', 
                borderRadius: '12px',
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                fontFamily: previewTemplate.tag === 'task' ? 'inherit' : 'Caveat, cursive',
                fontSize: previewTemplate.tag === 'task' ? '13px' : '17px',
                whiteSpace: 'pre-wrap',
                maxHeight: '280px',
                overflowY: 'auto'
              }}>
                <strong>{previewTemplate.title}</strong>
                <div style={{ marginTop: '8px', lineHeight: 1.5 }}>
                  {previewTemplate.content}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setPreviewId(null)}>Cancel</button>
              <button className="btn-submit" onClick={() => handleCreateFromTemplate(previewId)}>
                ✨ Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
