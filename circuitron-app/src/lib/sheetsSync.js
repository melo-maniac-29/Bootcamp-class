/**
 * Google Sheets Sync - Non-blocking background logger
 * Fire-and-forget wrapper around /api/sheets/log
 * Never blocks the main app workflow.
 */

export async function logToSheets(tab, rowData, getIdToken) {
  try {
    const token = getIdToken ? await getIdToken() : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Fire and forget — don't await in the caller
    fetch('/api/sheets/log', {
      method: 'POST',
      headers,
      body: JSON.stringify({ tab, data: rowData }),
    }).catch(() => {}); // Swallow errors silently
  } catch {
    // Never let sheets logging break the app
  }
}

// Pre-built loggers for common events
export function logQuizCompletion(userId, dayId, score, getIdToken) {
  logToSheets('QuizResults', {
    timestamp: new Date().toISOString(),
    userId,
    dayId,
    score,
    event: 'quiz_completed',
  }, getIdToken);
}

export function logSubmission(userId, dayId, status, getIdToken) {
  logToSheets('Submissions', {
    timestamp: new Date().toISOString(),
    userId,
    dayId,
    status,
    event: 'task_submitted',
  }, getIdToken);
}

export function logProgress(userId, dayId, progressData, getIdToken) {
  logToSheets('Progress', {
    timestamp: new Date().toISOString(),
    userId,
    dayId,
    ...progressData,
    event: 'progress_update',
  }, getIdToken);
}

export function logActivity(userId, action, details, getIdToken) {
  logToSheets('Activity', {
    timestamp: new Date().toISOString(),
    userId,
    action,
    details,
  }, getIdToken);
}
