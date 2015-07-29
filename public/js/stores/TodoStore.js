/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');
var jQuery = require('jquery');

var CHANGE_EVENT = 'change';

var _todos = {};
getAll();

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create(text) {
  // Hand waving here -- not showing how this interacts with XHR or persistent
  // server-side storage.
  // Using the current timestamp + random number in place of a real id.
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _todos[id] = {
    id: id,
    complete: false,
    text: text
  };
  TodoStore.emit(CHANGE_EVENT);
  return jQuery.ajax({
    url: 'http://localhost:3000/todos.json',
    type: 'POST',
    data: {
      todo: {
        text: text,
        complete: false
      }
    }
  }).done(function(data, status, xhr) {
    getAll();
  }).fail(function(xhr, status, error) {
    alert('$.ajax error!(POST /todos.json)');
  });
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update_impl(id, updates) {
  _todos[id] = assign({}, _todos[id], updates);
  return jQuery.ajax({
    url: 'http://localhost:3000/todos/' + id + '.json',
    type: 'POST',
    data: {
      todo: updates,
      _method: 'PATCH'
    }
  }).fail(function(xhr, status, error) {
    alert('$.ajax error!(PATCH /todos/:id.json)');
  });
}

function update(id, updates) {
  var promise = update_impl(id, updates)
    .done(function(data, status, xhr) {
      getAll();
    });
  TodoStore.emit(CHANGE_EVENT);
  return promise;
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.

 */
function updateAll(updates) {
  promises = [];
  for (var id in _todos) {
    promises.push(update_impl(id, updates));
  }
  TodoStore.emit(CHANGE_EVENT);
  return jQuery.when.apply(jQuery, promises)
    .done(function() {
      getAll();
    });
}

/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy_impl(id) {
  delete _todos[id];
  return jQuery.ajax({
    url: 'http://localhost:3000/todos/' + id + '.json',
    type: 'POST',
    data: {
      _method: 'DELETE'
    }
  }).fail(function(xhr, status, error) {
    alert('$.ajax error!(DELETE /todos/:id.json)');
  });
}

function destroy(id) {
  var promise = destroy_impl(id)
    .done(function(data, status, xhr) {
      getAll();
    });
  TodoStore.emit(CHANGE_EVENT);
  return promise;
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted() {
  promises = [];
  for (var id in _todos) {
    if (_todos[id].complete) {
      promises.push(destroy(id));
    }
  }
  TodoStore.emit(CHANGE_EVENT);
  return jQuery.when.apply(jQuery, promises)
    .done(function() {
      getAll();
    });
}

function getAll() {
  return jQuery.ajax({
    url: 'http://localhost:3000/todos.json',
  }).done(function(data, status, xhr) {
    var todos = {};
    data.forEach(function(todo) {
      todos[todo.id] = todo;
    });
    _todos = todos;
    TodoStore.emit(CHANGE_EVENT);
  }).fail(function(xhr, status, error) {
    alert('$.ajax error!(GET /todos.json)');
  });
}

var TodoStore = assign({}, EventEmitter.prototype, {

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function() {
    for (var id in _todos) {
      if (!_todos[id].complete) {
        return false;
      }
    }
    return true;
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function() {
    return _todos;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
  var text;

  switch(action.actionType) {
    case TodoConstants.TODO_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text);
      }
      break;

    case TodoConstants.TODO_TOGGLE_COMPLETE_ALL:
      if (TodoStore.areAllComplete()) {
        updateAll({complete: false});
      } else {
        updateAll({complete: true});
      }
      break;

    case TodoConstants.TODO_UNDO_COMPLETE:
      update(action.id, {complete: false});
      break;

    case TodoConstants.TODO_COMPLETE:
      update(action.id, {complete: true});
      break;

    case TodoConstants.TODO_UPDATE_TEXT:
      text = action.text.trim();
      if (text !== '') {
        update(action.id, {text: text});
      }
      break;

    case TodoConstants.TODO_DESTROY:
      destroy(action.id);
      break;

    case TodoConstants.TODO_DESTROY_COMPLETED:
      destroyCompleted();
      break;

    default:
      // no op
  }
});

module.exports = TodoStore;
