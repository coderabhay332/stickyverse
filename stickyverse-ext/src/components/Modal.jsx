import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { generateUUID } from '../utils/uuid';

const TAG_COLORS = { note: 'purple', task: 'blue', checklist: 'blue', idea: 'yellow', quote: 'green', link: 'pink' };
const TAGS = ['note', 'task', 'checklist', 'idea', 'quote'];
const COLORS = [
  { id: 'purple', hex: '#EDE9FE' },
  { id: 'blue',   hex: '#DBEAFE' },
  { id: 'green',  hex: '#D1FAE5' },
  { id: 'yellow', hex: '#FEF9C3' },
  { id: 'pink',   hex: '#FCE7F3' },
  { id: 'orange', hex: '#FFEDD5' },
  { id: 'cream',  hex: '#FFFBEB' },
  { id: 'dark',   hex: '#1E1B4B' },
];
const FONT_COLORS = [
  { id: 'default', label: 'Default', hex: 'transparent' },
  { id: 'dark',    label: 'Dark Indigo', hex: '#1E1B4B' },
  { id: 'gray',    label: 'Charcoal', hex: '#374151' },
  { id: 'purple',  label: 'Purple', hex: '#5B21B6' },
  { id: 'blue',    label: 'Blue', hex: '#1E3A8A' },
  { id: 'green',   label: 'Green', hex: '#065F46' },
  { id: 'red',     label: 'Red', hex: '#991B1B' },
];
const PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'];

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

export function Modal({ type, onClose }) {
  const { setNotes, user, supabase, editingNote, setEditingNote, premiumUnlocked, setShowPremiumModal } = useAppContext();
  const [title, setTitle] = useState(editingNote && editingNote.title ? editingNote.title : '');
  const [content, setContent] = useState(editingNote && editingNote.content ? editingNote.content : (type === 'checklist' || type === 'task') ? '[ ] ' : '');
  const [color, setColor] = useState(editingNote && editingNote.color ? editingNote.color : 'purple');
  const [customColor, setCustomColor] = useState(editingNote && editingNote.customColor ? editingNote.customColor : '');
  const [tag, setTag] = useState(editingNote && editingNote.tag ? editingNote.tag : 'note');
  const [priority, setPriority] = useState(editingNote && editingNote.priority ? editingNote.priority : 'none');
  const [status, setStatus] = useState(editingNote && editingNote.status ? editingNote.status : 'none');
  const [font, setFont] = useState(editingNote && editingNote.font ? editingNote.font : 'default');
  const [fontColor, setFontColor] = useState(editingNote && editingNote.fontColor ? editingNote.fontColor : '');
  const [reminder, setReminder] = useState(editingNote && editingNote.reminder ? editingNote.reminder : '');
  const [saving, setSaving] = useState(false);

  const savedIdRef = useRef(editingNote ? editingNote.id : null);
  const hasCreatedRef = useRef(!!editingNote);

  // Automatically insert checklist box or hyphen for new empty notes when tag toggles
  useEffect(() => {
    if (!editingNote && !title.trim() && !content.trim()) {
      if (tag === 'checklist') {
        setContent('[ ] ');
      } else if (tag === 'task') {
        setContent('- ');
      } else {
        setContent('');
      }
    }
  }, [tag]);

  // Handle smart lists (Space/Enter checkbox behaviors)
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // Get current line
      const beforeCursor = text.substring(0, start);
      const afterCursor = text.substring(end);
      const linesBefore = beforeCursor.split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      // If hitting enter on an empty prefix, delete the prefix instead of making a new line
      if (currentLine === '[ ] ' || currentLine === '[x] ' || currentLine === '• ' || currentLine === '- ') {
        e.preventDefault();
        const newText = text.substring(0, start - currentLine.length) + '\n' + afterCursor;
        setContent(newText);
        const newCursorPos = start - currentLine.length + 1;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        return;
      }

      // Check if current line has prefix to propagate
      let prefix = '';
      if (currentLine.startsWith('[x] ')) {
        prefix = '[ ] ';
      } else if (currentLine.startsWith('[ ] ')) {
        prefix = '[ ] ';
      } else if (currentLine.startsWith('• ')) {
        prefix = '• ';
      } else if (currentLine.startsWith('- ')) {
        prefix = '- ';
      } else if (tag === 'checklist') {
        prefix = '[ ] ';
      } else if (tag === 'task') {
        prefix = '- ';
      }

      if (prefix) {
        e.preventDefault();
        const newText = beforeCursor + '\n' + prefix + afterCursor;
        setContent(newText);

        const newCursorPos = start + 1 + prefix.length;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  // Autosave effect
  useEffect(() => {
    if (!hasCreatedRef.current && !title.trim() && !content.trim()) return;

    let targetId = savedIdRef.current;
    let isNew = !hasCreatedRef.current;

    // Reset reminderTriggered if the reminder changes or is newly set
    const isReminderChanged = editingNote ? editingNote.reminder !== reminder : reminder !== '';

    // Helper to format note for Supabase sync (to avoid columns count mismatch or violating CHECK constraints)
    const toRow = (n) => ({
      id: n.id,
      user_id: user?.id,
      title: n.title,
      content: n.content,
      type: n.tag === 'checklist' ? 'checklist' : n.tag === 'quote' ? 'quote' : 'note',
      style: n.tag === 'quote' ? 'polaroid' : 'regular', // standard fallback style
      color: ['purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark'].includes(n.color) ? n.color : 'purple', // db enum valid value
      tag: n.tag || 'note',
      status: n.status || 'none',
      priority: n.priority === 'none' ? null : (n.priority || 'medium'),
      pinned: !!n.pinned,
      starred: !!n.starred,
      items: {
        customColor: n.customColor || null,
        fontColor: n.fontColor || null
      },
      author: n.tag === 'quote' ? (n.title || '') : null,
      created_at: new Date(n.created).toISOString(),
      updated_at: new Date(n.updated).toISOString(),
    });

    if (isNew) {
      targetId = generateUUID();
      savedIdRef.current = targetId;
      hasCreatedRef.current = true;

      const newNote = {
        id: targetId,
        title: title.trim() || null,
        content: content.trim(),
        color,
        customColor: customColor || null,
        fontColor: fontColor || null,
        tag,
        priority,
        status,
        font,
        reminder: reminder || null,
        reminderTriggered: false,
        pinned: false,
        starred: false,
        archived: false,
        created: Date.now(),
        updated: Date.now(),
      };

      setNotes(prev => [newNote, ...prev]);

      if (user && supabase) {
        Promise.resolve(supabase.from('notes').insert(toRow(newNote))).catch(console.error);
      }
    } else {
      setNotes(prev => prev.map(n => n.id === targetId ? {
        ...n,
        title: title.trim() || null,
        content: content.trim(),
        color,
        customColor: customColor || null,
        fontColor: fontColor || null,
        tag,
        priority,
        status,
        font,
        reminder: reminder || null,
        reminderTriggered: isReminderChanged ? false : n.reminderTriggered,
        updated: Date.now()
      } : n));

      const timer = setTimeout(() => {
        if (user && supabase) {
          const updatedNote = {
            id: targetId,
            title: title.trim() || null,
            content: content.trim(),
            color,
            customColor: customColor || null,
            fontColor: fontColor || null,
            tag,
            priority,
            status,
            font,
            reminder: reminder || null,
            created: editingNote ? editingNote.created : Date.now(),
            updated: Date.now()
          };
          Promise.resolve(supabase.from('notes').update(toRow(updatedNote)).eq('id', targetId)).catch(console.error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [title, content, color, customColor, fontColor, tag, priority, status, font, reminder]);

  const handleClose = () => {
    // Cleanup blank auto-created cards
    if (hasCreatedRef.current && !title.trim() && !content.trim()) {
      const targetId = savedIdRef.current;
      setNotes(prev => prev.filter(n => n.id !== targetId));
      if (user && supabase) {
        Promise.resolve(supabase.from('notes').delete().eq('id', targetId)).catch(console.error);
      }
    }
    setEditingNote(null);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this note?')) {
      const targetId = savedIdRef.current;
      setNotes(prev => prev.filter(n => n.id !== targetId));
      if (user && supabase) {
        try {
          await supabase.from('notes').delete().eq('id', targetId);
        } catch (e) {
          console.error(e);
        }
      }
      setEditingNote(null);
      onClose();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setEditingNote(null);
    onClose();
  };

  const handleApplyTemplate = (e) => {
    const selected = e.target.value;
    if (!selected) return;
    const template = TEMPLATES_MAP[selected];
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setColor(template.color);
      setTag(template.tag);
      setPriority(template.priority || 'none');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={`modal font-${font}`}>
        <div className="modal-header">
          <h2>{editingNote ? '✏️ Edit' : '✨ New'} {tag.charAt(0).toUpperCase() + tag.slice(1)}</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Tag selector */}
          <div className="form-group">
            <label>Type</label>
            <div className="tag-selector">
              {TAGS.map(t => (
                <button key={t} type="button" className={`tag-btn ${tag === t ? 'active' : ''}`} onClick={() => setTag(t)}>
                  {t === 'note' ? '📝' : t === 'task' ? '✅' : t === 'checklist' ? '☑️' : t === 'idea' ? '💡' : '💬'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selector dropdown */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Insert Template</span>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>(Fills title, content, color, and type)</span>
            </label>
            <select
              className="glass-select"
              value=""
              onChange={handleApplyTemplate}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            >
              <option value="">-- Apply a Template --</option>
              <optgroup label="💼 Work Templates">
                <option value="daily_plan">☀️ Daily Plan</option>
                <option value="weekly_review">📅 Weekly Review</option>
                <option value="monthly_review">📅 Monthly Review</option>
                <option value="meeting_notes">🎙️ Meeting Notes</option>
                <option value="one_on_one">👥 1 on 1 Meeting</option>
                <option value="client_brief">💼 Client Brief</option>
                <option value="status_update">📊 Status Update</option>
                <option value="okrs">🎯 OKRs</option>
              </optgroup>
              <optgroup label="👤 Personal Templates">
                <option value="brain_dump">⚡ Brain Dump</option>
                <option value="morning_routine">🌅 Morning Routine</option>
                <option value="evening_reflection">🌙 Evening Reflection</option>
                <option value="weekly_goals">🎯 Weekly Goals</option>
                <option value="reading_list">📚 Reading List</option>
                <option value="workout_plan">💪 Workout Plan</option>
              </optgroup>
              <optgroup label="💡 Creator Templates">
                <option value="content_idea">💡 Content Idea</option>
                <option value="twitter_thread">🐦 Twitter Thread</option>
                <option value="blog_outline">✍️ Blog Post Outline</option>
              </optgroup>
              <optgroup label="🚀 Founder Templates">
                <option value="idea_validation">🚀 Idea Validation</option>
                <option value="launch_plan">🏁 Launch Plan</option>
                <option value="user_interview">👤 User Interview Notes</option>
              </optgroup>
              <optgroup label="🧠 Quick Notes Templates">
                <option value="questions">❓ Questions to Answer</option>
                <option value="idea_parking">🧠 Idea Parking Lot</option>
              </optgroup>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter a title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content</label>
            <textarea
              className="modal-textarea"
              placeholder={tag === 'task' ? "• Task item\n• Another task\n[x] Completed task" : tag === 'checklist' ? "Attendees & Time\nAgenda Items\nKey Decisions" : "Write something..."}
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>

          {/* Color Picker */}
          <div className="form-group">
            <label>Color</label>
            <div className="color-picker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {COLORS.map(c => (
                <div
                  key={c.id}
                  className={`color-swatch ${color === c.id && !customColor ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => {
                    setColor(c.id);
                    setCustomColor('');
                  }}
                  title={c.id}
                />
              ))}
              {/* Custom Color Picker Swatch */}
              <div
                className={`color-swatch custom-swatch ${customColor ? 'selected' : ''}`}
                style={{
                  background: customColor || 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  border: customColor ? '2px solid #fff' : 'none'
                }}
                title="Custom Color"
                onClick={() => document.getElementById('custom-color-input').click()}
              >
                🌈
                <input
                  type="color"
                  id="custom-color-input"
                  value={customColor || '#7C3AED'}
                  onChange={e => {
                    setCustomColor(e.target.value);
                    setColor('custom'); // standard color key ignored since customColor takes priority
                  }}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Font Color Picker */}
          <div className="form-group">
            <label>Font Color</label>
            <div className="color-picker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {FONT_COLORS.map(c => (
                <div
                  key={c.id}
                  className={`color-swatch ${fontColor === c.hex || (c.id === 'default' && !fontColor) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: c.hex === 'transparent' ? '#ffffff' : c.hex,
                    border: c.hex === 'transparent' ? '2px dashed rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    setFontColor(c.hex === 'transparent' ? '' : c.hex);
                  }}
                  title={c.label}
                >
                  {c.id === 'default' && <span style={{ fontSize: '9px', color: '#000' }}>❌</span>}
                </div>
              ))}
              {/* Custom Font Color Picker */}
              <div
                className={`color-swatch custom-swatch ${fontColor && !FONT_COLORS.some(c => c.hex === fontColor) ? 'selected' : ''}`}
                style={{
                  background: fontColor && !FONT_COLORS.some(c => c.hex === fontColor) ? fontColor : 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff',
                  border: fontColor && !FONT_COLORS.some(c => c.hex === fontColor) ? '2px solid #fff' : 'none'
                }}
                title="Custom Font Color"
                onClick={() => document.getElementById('custom-font-color-input').click()}
              >
                🌈
                <input
                  type="color"
                  id="custom-font-color-input"
                  value={fontColor && !FONT_COLORS.some(c => c.hex === fontColor) ? fontColor : '#ffffff'}
                  onChange={e => {
                    setFontColor(e.target.value);
                  }}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority</label>
            <div className="tag-selector">
              {PRIORITIES.map(p => (
                <button key={p} type="button" className={`tag-btn ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                  {p === 'none' ? 'None' : p === 'low' ? '🟢 Low' : p === 'medium' ? '🟡 Medium' : p === 'high' ? '🟠 High' : '🔴 Urgent'}
                </button>
              ))}
            </div>
          </div>

          {/* Work Status */}
          <div className="form-group">
            <label>Work Status</label>
            <select
              className="glass-select"
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
            >
              <option value="none">— None —</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="delayed">⏳ Delayed</option>
              <option value="waiting">🕐 Waiting for Approval</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          {/* Reminder Date & Time */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⏰ Set Reminder (Optional)</span>
              {reminder && (
                <button
                  type="button"
                  onClick={() => setReminder('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '0 4px',
                    fontWeight: 600,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Clear
                </button>
              )}
            </label>
            <input
              type="datetime-local"
              className="modal-input"
              value={reminder}
              onChange={e => setReminder(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          {/* Font Selector */}
          <div className="form-group">
            <label>Font Style</label>
            <div className="tag-selector" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'default', label: 'Sans', premium: false },
                { id: 'handwriting', label: 'Cursive', premium: false },
                { id: 'mono', label: 'Mono', premium: false },
                { id: 'serif', label: 'Serif', premium: false },
                { id: 'signature', label: '✒️ Signature 👑', premium: true },
                { id: 'playful', label: '🎈 Playful 👑', premium: true },
                { id: 'chalkboard', label: '✏️ Chalkboard 👑', premium: true },
                { id: 'dyslexic', label: '👁️ Dyslexic 👑', premium: true },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`tag-btn ${font === f.id ? 'active' : ''}`}
                  onClick={() => {
                    if (f.premium && !premiumUnlocked) {
                      setShowPremiumModal(true);
                    } else {
                      setFont(f.id);
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {savedIdRef.current && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleDelete}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', fontSize: '12px' }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-cancel" onClick={handleClose}>Cancel</button>
              <button type="submit" className="btn-submit">Done</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
