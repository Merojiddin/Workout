import type { WorkoutSession } from '../data/workoutSessions'
import {
  formatSessionDate,
  getSessionDuration,
  getSessionSetCount,
  isWorkoutCompleted,
} from '../utils/progressUtils'

interface WorkoutHistoryTableProps {
  onSelectSession: (session: WorkoutSession) => void
  sessions: WorkoutSession[]
}

export function WorkoutHistoryTable({
  onSelectSession,
  sessions,
}: WorkoutHistoryTableProps) {
  if (sessions.length === 0) {
    return (
      <article className="history-card">
        <p className="eyebrow">Workout History</p>
        <h2>Recent workouts</h2>
        <div className="chart-empty-state">
          No workout history yet. Complete your first workout to see it here.
        </div>
      </article>
    )
  }

  return (
    <article className="history-card">
      <div>
        <p className="eyebrow">Workout History</p>
        <h2>Recent workouts</h2>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Workout</th>
              <th>Exercises</th>
              <th>Sets</th>
              <th>Duration</th>
              <th>Completed</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 10).map((session) => (
              <tr key={session.id}>
                <td>{formatSessionDate(session.date)}</td>
                <td>{session.workoutName}</td>
                <td>{session.exercises.length}</td>
                <td>{getSessionSetCount(session)}</td>
                <td>{getSessionDuration(session)}</td>
                <td>{isWorkoutCompleted(session) ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    className="table-action-button"
                    onClick={() => onSelectSession(session)}
                    type="button"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
