import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Circle,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import useTodoStore from './store/useTodoStore';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function App() {
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const addInputRef = useRef(null);
  const editInputRef = useRef(null);

  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  function handleSubmit(e) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;

    addTodo(value);
    setTitle('');
    addInputRef.current?.focus();
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  function saveEdit() {
    const value = editText.trim();
    if (!value) {
      cancelEdit();
      return;
    }
    updateTodo(editingId, value);
    cancelEdit();
  }

  function handleEditKeyDown(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function handleDelete(id) {
    setDeletingId(id);
    setTimeout(() => {
      deleteTodo(id);
      setDeletingId(null);
    }, 220);
  }

  return (
    <div className="app">
      <div className="card">
        <header className="card-header">
          <div className="brand">
            <span className="brand-icon">
              <ClipboardList size={24} />
            </span>
            <div>
              <h1>My Tasks</h1>
              <p className="subtitle">
                {todos.length === 0
                  ? 'Nothing here yet'
                  : `${activeCount} of ${todos.length} left to do`}
              </p>
            </div>
          </div>
          {completedCount > 0 && (
            <button
              type="button"
              className="clear-btn"
              onClick={clearCompleted}
            >
              <Trash2 size={14} />
              Clear done
            </button>
          )}
        </header>

        <form className="add-form" onSubmit={handleSubmit}>
          <input
            ref={addInputRef}
            type="text"
            className="add-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="New task"
          />
          <button
            type="submit"
            className="add-btn"
            disabled={!title.trim()}
            aria-label="Add task"
          >
            <Plus size={20} />
          </button>
        </form>

        <nav className="filters" role="tablist" aria-label="Filter tasks">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`filter-btn ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <ul className="todo-list">
          {visibleTodos.map((todo) => {
            const isEditing = editingId === todo.id;
            const isDeleting = deletingId === todo.id;

            return (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${
                  isDeleting ? 'leaving' : ''
                }`}
              >
                <button
                  type="button"
                  className="check-btn"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={
                    todo.completed ? 'Mark as active' : 'Mark as completed'
                  }
                >
                  {todo.completed ? (
                    <Check size={14} />
                  ) : (
                    <Circle size={14} />
                  )}
                </button>

                {isEditing ? (
                  <div className="edit-row">
                    <input
                      ref={editInputRef}
                      type="text"
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEdit}
                      aria-label="Edit task"
                    />
                    <button
                      type="button"
                      className="icon-btn save"
                      onClick={saveEdit}
                      aria-label="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn cancel"
                      onClick={cancelEdit}
                      aria-label="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="item-row">
                    <span
                      className="todo-title"
                      onDoubleClick={() => startEdit(todo)}
                    >
                      {todo.title}
                    </span>
                    <div className="actions">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit(todo)}
                        aria-label="Edit task"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => handleDelete(todo.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {visibleTodos.length === 0 && (
          <div className="empty">
            <ClipboardList size={40} />
            <p>
              {todos.length === 0
                ? 'Add your first task above'
                : filter === 'active'
                  ? 'No active tasks, you are all done!'
                  : 'No completed tasks yet'}
            </p>
          </div>
        )}

        {todos.length > 0 && (
          <footer className="card-footer">
            <span>
              {activeCount} item{activeCount === 1 ? '' : 's'} left
            </span>
            <span className="hint">Double-click a task to edit</span>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
