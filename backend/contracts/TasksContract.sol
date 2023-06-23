// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

contract TasksContract {

  event AddTask(address recipient, uint taskId);
  event DeleteTask(uint taskId, bool isDeleted);

  struct Task {
    uint id;
    string taskText;
    bool isDeleted;
  }

  // using structure (struct) as below returns an object in reference to above structure created.i.e., { id: 0, taskText: 'clean', isDeleted: false }
  // Task(0, 'clean', false)

  Task[] private tasks;
  mapping(uint256 => address) taskToOwner; // taskToOwner is just a variable here

  function addTask(string memory taskText, bool isDeleted) external {
    uint taskId = tasks.length;
    tasks.push(Task(taskId, taskText, isDeleted));
    taskToOwner[taskId] = msg.sender;
    emit AddTask(msg.sender, taskId);
  }

  // get your personal tasks that are not yet deleted
  function getMyTasks() external view returns (Task[] memory) {
    Task[] memory temporary = new Task[](tasks.length); // limiting the temporary array size to that of tasks array
    uint counter = 0;

    for(uint i=0; i<tasks.length; i++) {
      if(taskToOwner[i] == msg.sender && !tasks[i].isDeleted) {
        temporary[counter] = tasks[i];
        counter++;
      }
    }

    Task[] memory result = new Task[](counter);
    for(uint i=0; i<counter; i++) {
      result[i] = temporary[i];
    }

    return result;
  }

  function deleteTask(uint taskId, bool isDeleted) external {
    if (taskToOwner[taskId] == msg.sender) {
      tasks[taskId].isDeleted = isDeleted;  // true
      emit DeleteTask(taskId, isDeleted);
    }
  }
}
