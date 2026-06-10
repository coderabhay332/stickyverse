import React, { useMemo } from 'react';
import { useAppContext } from '../App';
import { NoteCard } from './NoteCard';
import { EmptyState } from './EmptyState';
import { generateUUID } from '../utils/uuid';

const TEMPLATES = [
  { id: 'daily_plan',    title: '☀️ Daily Plan',    em: '☀️', desc: 'Focus, tasks, meetings, and goals' },
  { id: 'weekly_review', title: '📅 Weekly Review', em: '📅', desc: 'Wins, failures, lessons, and metrics' },
  { id: 'brain_dump',    title: '⚡ Brain Dump',    em: '⚡', desc: 'Mind decluttering and prioritizing' },
  { id: 'meeting_notes', title: '🎙️ Meeting Notes', em: '🎙️', desc: 'Agenda, key points, and action items' },
  { id: 'content_idea',  title: '💡 Content Idea',  em: '💡', desc: 'Hooks, main points, and CTAs' },
  { id: 'idea_parking',  title: '🧠 Idea Parking Lot', em: '🧠', desc: 'Capture thoughts to revisit later' },
];

export function NotesGrid() {
  const { notes, links, filter, sortBy, searchQuery, setNotes, setLinks, user, supabase } = useAppContext();

  const filtered = useMemo(() => {
    let arr = notes.filter(n => n && !n.archived && n.title !== '__sv_streaks__');

    // Map links state to note structure
    const mappedLinks = (links || []).map(l => ({
      id: l.id,
      title: l.title || '',
      content: l.url || '',
      color: 'purple',
      tag: 'link',
      priority: 'none',
      status: 'none',
      pinned: false,
      starred: false,
      archived: false,
      created: l.created || Date.now(),
      updated: l.created || Date.now(),
      host: l.host,
      favicon: l.favicon,
      note: l.note,
      isLinkVaultItem: true // Custom property to route deletes back to links
    }));

    if (filter === 'link') {
      arr = mappedLinks;
    } else if (filter === 'all') {
      arr = [...arr, ...mappedLinks];
    } else {
      arr = arr.filter(n => n && n.tag === filter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arr = arr.filter(n =>
        n && (
          (n.title || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q) ||
          (n.note || '').toLowerCase().includes(q)
        )
      );
    }

    // Sort
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
    return [...arr].sort((a, b) => {
      if (!a || !b) return 0;
      switch (sortBy) {
        case 'oldest':      return (a.created || 0) - (b.created || 0);
        case 'updated':     return ((b.updated || b.created) || 0) - ((a.updated || a.created) || 0);
        case 'priority':    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'alphabetical':return (a.title || '').localeCompare(b.title || '');
        case 'status':
          const statusOrder = { completed: 5, 'in-progress': 4, delayed: 3, waiting: 2, cancelled: 1, none: 0 };
          return (statusOrder[b.status || 'none'] || 0) - (statusOrder[a.status || 'none'] || 0);
        case 'category':    return (a.tag || '').localeCompare(b.tag || '');
        default:            return (b.created || 0) - (a.created || 0);
      }
    });
  }, [notes, links, filter, sortBy, searchQuery]);

  const handleCreateFromTemplate = async (type) => {
    const templates = {
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
        content: "Month:\n\nTop 3 wins:\n→ \n→ \n→ \n\nTop 3 failures and lessons:\n→ \n→ \n→ \n\nRevenue / key metric:\n\nHabits kept:\n\nHabits broken:\n\nFocus for next month:",
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

    const template = templates[type];
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

      setNotes(prev => [newNote, ...prev]);

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
          priority: newNote.priority === 'none' ? null : (newNote.priority || 'medium'),
          pinned: !!newNote.pinned,
          starred: !!newNote.starred,
          items: {},
          created_at: new Date(newNote.created).toISOString(),
          updated_at: new Date(newNote.updated).toISOString(),
        };
        try {
          const { error } = await supabase.from('notes').insert(row);
          if (error) console.error('Failed to sync template note:', error.message);
        } catch (e) {
          console.error('Failed to sync template note:', e.message);
        }
      }
    }
  };

  if (filtered.length === 0) {
    const isBrandNew = notes.length === 0;
    return (
      <div>
        {isBrandNew && (
          <div className="onboarding-banner" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1.5px dashed rgba(139, 92, 246, 0.35)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#e8dfee',
            fontSize: '13.5px',
            boxShadow: '0 4px 15px -3px rgba(139, 92, 246, 0.1)'
          }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            <div>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '2px', fontSize: '14.5px' }}>Welcome to StickyVerse!</strong>
              Press <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 1px 0 rgba(0,0,0,0.2)' }}>Spacebar</kbd> anywhere on this screen to instantly open the Create Note modal.
            </div>
          </div>
        )}
        <EmptyState 
          message="No notes here yet" 
          action={isBrandNew ? "Press Spacebar or click the + button to create your first note!" : "Click the + button to create your first note"} 
        />
        
        {/* Quick Templates Row */}
        {(filter === 'all' || filter === 'note' || filter === 'task') && (
          <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
            <div style={{
              fontSize: 10, fontFamily: 'Geist Mono, monospace', letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16
            }}>
              ✨ Quick Start Templates
            </div>
            <div className="templates-grid">
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  className="template-card"
                  onClick={() => handleCreateFromTemplate(t.id)}
                  style={{ padding: '16px 12px' }}
                >
                  <div className="template-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>{t.em}</div>
                  <div className="template-title" style={{ fontSize: '0.85rem', marginBottom: 2 }}>{t.title}</div>
                  <div className="template-desc" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="notes-masonry">
        {filtered.map((note, i) => (
          <NoteCard key={note.id} note={note} index={i} />
        ))}
      </div>
    </div>
  );
}
