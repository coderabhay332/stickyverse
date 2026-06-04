import React from 'react';

export function EmptyState({ message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">✨</div>
      <div className="empty-message">{message}</div>
      <div className="empty-action">{action}</div>
    </div>
  );
}
