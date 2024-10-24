pragma solidity >=0.5.0 <0.9.0;


contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
  }

  mapping(uint => Task) public tasks;

  constructor() public {
        createTask("Hi initial Task...");
      }

  function createTask(string memory _content) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);
  }

  event TaskCompleted(
    uint id,
    bool completed
  );

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

   function fetchTask(uint _id) public view returns (uint, string memory, bool) {
    Task memory _task = tasks[_id];
    return (_task.id, _task.content, _task.completed);
    }



}