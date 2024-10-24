import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config';
import { CheckCircle, Circle, Plus, Wallet, Loader } from 'lucide-react';

const App = () => {
  const [account, setAccount] = useState('');
  const [todoList, setTodoList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  async function loadBlockchainData() {
    const web3 = new Web3("http://127.0.0.1:7545");
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const todoListContract = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);
    setTodoList(todoListContract);
    await loadTasks(todoListContract);
  }

  async function loadTasks(contract = todoList) {
    setIsLoading(true);
    const taskCount = await contract.methods.taskCount().call();
    let tasksArray = [];
    for (let i = 1; i <= taskCount; i++) {
      const task = await contract.methods.tasks(i).call();
      tasksArray.push(task);
    }
    setTasks(tasksArray);
    setIsLoading(false);
  }

  async function addTask(e) {
    e.preventDefault();
    if (newTask && todoList) {
      setIsLoading(true);
      try {
        await todoList.methods.createTask(newTask).send({ from: account });
        setNewTask('');
        await loadTasks();
      } catch (error) {
        console.error('Error adding task:', error);
      }
      setIsLoading(false);
    }
  }

  async function toggleTaskCompletion(taskId) {
    if (todoList) {
      setIsLoading(true);
      try {
        await todoList.methods.toggleCompleted(taskId).send({ from: account });
        await loadTasks();
      } catch (error) {
        console.error('Error toggling task:', error);
      }
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #e0f7ff, #e3e0ff)', padding: '32px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header with account info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            Blockchain Todo List
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#fff', borderRadius: '9999px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <Wallet style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#6b7280' }}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        </div>

        {/* Main content card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
          {/* Add task form */}
          <form onSubmit={addTask} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to be done?"
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !newTask}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  opacity: isLoading || !newTask ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <Loader style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Plus style={{ width: '20px', height: '20px' }} />
                )}
                Add Task
              </button>
            </div>
          </form>

          {/* Tasks grid */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
              <Loader style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#6b7280' }}>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {tasks.map((task, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: task.completed ? '1px solid #86efac' : '1px solid #e5e7eb',
                    backgroundColor: task.completed ? '#f0fdf4' : '#f9fafb',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      style={{
                        marginTop: '4px',
                        background: 'none',
                        border: 'none',
                        color: task.completed ? '#4ade80' : '#9ca3af',
                        cursor: 'pointer',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {task.completed ? (
                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                      ) : (
                        <Circle style={{ width: '20px', height: '20px' }} />
                      )}
                    </button>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: task.completed ? '#9ca3af' : '#374151', textDecoration: task.completed ? 'line-through' : 'none' }}>
                        {task.content}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Task #{task.id.toString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
