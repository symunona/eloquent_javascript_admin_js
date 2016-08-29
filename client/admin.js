/**
 * Description
 *
 * Basic frontend application to edit and handle backend files in a given directory
 * on fileserver, which using a using a HTTP REST API. Provides an extensible interface
 * to create new controls (for example directory change field) for the developers.
 *
 * This documentation describes the structure and the way of working of the **admin.js**.
 * The public interfaces described here, the others are in comments in the js file.
 *
 * How does it works?
 *
 * Structure
 * * Admin module:
 *   * module exports
 *   * internal variables
 *   * internal control element registrations
 *   * AdminPanel prototype
 *   * FileServer prototype
 *
 * The client application name is *Admin* it provides an *AdminPanel* instance, which
 * generate the application into a target DOM element. The application is built up by
 * *controls* which are defined by a constructor functions. The constructor functions
 * can be registered before the AdminPanel instance is created.
 *
 * An example for *control* is an editor window which is represented with a textarea DOM
 * element.
 *
 * The *controls*'s constructor functions are executed, when a new *AdminPanel* instance
 * is created. These functions provides DOM elements with configured event listeners
 * which gaves the user interface and its business logic. When the DOM elements are
 * built, the constructor function gets the *AdminPanel* instance's as a *this* parameter,
 * so through possible to reach the instance's interface even from an event listener.
 *
 * The *AdminPanel* instance has an interface for all of the *controls*, which can be
 * interrogated and manipulated by the DOM interface by other *controls*.
 *
 * The *AdminPanel* instance also proivdes access to a *FileManager* instance, which
 * is responsible for the async HTTP request handling, and gave some basic abstraction
 * of the files server API. The *FileManager* methods returns *Promises* to build
 * app async control chains.
 *
 * @see http:eloquentjavascript.net/20_node.html#h_LvXChBt2KP for backend fileserver API documentation
 * @see https://www.promisejs.org/api/](https://www.promisejs.org/api/ for promise documentation.
 *
 * @module Admin
 */
var Admin = (function(Promise) {
  'use strict'

  /**
   * Variable will be exported at the end of this module publicly.
   * @private
   * @type {Object}
   */
  var exports = {};

  /**
   * Register a control tool constructor function with a given name. The element will be built,
   * when a new AdminPanel instance will be created with the Admin.newAdminPanel() function whithin
   * the context of the AdminPanel instance.
   *
   * The constructorFunction must return a fully functioning DOM element with registered
   * event handlers. This will be shown on the UI, representing the created control.
   *
   * The constructorFunction gets the created AdminPanel instance as a self parameter,
   * to be accessible even from inside the event handler.
   *
   * @param  {string} controlElementName    The name of the control element, this is the reference for that.
   * @param  {function} constructorFunction The function which builds the control element.
   * @exports
   * @throws {Error}                        If the controlElement is already added with the given name.
   */
  function registerControl (controlElementName, constructorFunction) {
    if(controlElementName in registeredControls) throw new Error('This control is already added: ' + controlElementName);
    registeredControls[controlElementName] = constructorFunction;
  }
  exports.registerControl = registerControl;

  /**
   * Creates an admin panel instance and interface into a targetDomElement from all
   * previously registered controls, also displays the interface too. This is the basic
   * usage of the module.
   * @param  {DOMElement} target The target DOM element to generate the interface.
   * @return {AdminPanel}        Contructs and returns an AdminPanel instance.
   */
  function newAdminPanel(target) {
    return new AdminPanel(target);
  }
  exports.newAdminPanel = newAdminPanel;


  /**
   * Stores the registered constructor functions of the control elements.
   * @private
   * @type  {Object}
   */
  var registeredControls = Object.create(null);

  /**
   * Registered internal controls
   * ============================
   * These names are used for the general control elements shown by default on
   * on the user interface.
   */

  /**
   * This is the main editor window where the file content can be shown. A stupid
   * textarea.
   * @name editorWindow
   * @kind control element consturctor function
   */
  registerControl('editorWindow', function(self) {
    return self.createDomElement('textarea', {cols:100, rows:20, id: 'editor'});
  });

  /**
   * Provides a Save Button, which saves the file selected in the fileList object.
   * @name saveButton
   * @kind control element consturctor function
   */
  registerControl('saveButton', function(self) {
    var saveButton = self.createDomElement('button', null, 'Save');
    saveButton.addEventListener('click', function(event) {
      if(!self.getControl('fileList').value) {
        console.log('nothing to save here...');
        return;
      };
      self.fileManager.saveOrCreateFile(self.getControl('fileList').value, self.getControl('editorWindow').value);
    });
    return saveButton;
  });

  /**
   * Provides a simple DIV element which creates a new line of tools.
   * @name delimiter
   * @kind control element consturctor function
   */
  registerControl('delimiter', function(self) { return self.createDomElement('div', null); });

  /**
   * Provides a file list element, shows all the files in the base directory in
   * a simple select. If a file selected it's content is automatically loaded into
   * the editorWindow control element.
   * @name fileList
   * @kind control element consturctor function
   */
  registerControl('fileList', function (self) {
    var fileList = self.createDomElement('select', {size: 10});
    fileList.addEventListener('change', function(event) {
      self.fileManager.loadContent(event.target.value)
        .then(function(result) {self.getControl('editorWindow').value = result})
        .catch(function(error) {console.error(error); } );
    });
    self.fileManager.udpateFileList()
      .then(function(result) { self.updateChildren( self.getControl('fileList'), result); } )
      .catch(function(error) {console.error(error); } );
    return fileList;
  });

  /**
   * Provides a text input and a submit to create a new file in the base directory.
   * @name newFileForm
   * @kind control element consturctor function
   */
  registerControl('newFileForm', function (self) {
    var newFileForm = self.createDomElement(
      'form', {style: 'display: inline'},
        self.createDomElement('input', {type: 'text', name: 'new-filename'}),
        self.createDomElement('input', {type: 'submit', value: 'Create a file'})
    );

    newFileForm.addEventListener('submit', function(event) {
      event.preventDefault();
      self.fileManager.saveOrCreateFile(event.target.elements['new-filename'].value, null)
        .catch(function (error) { console.error('Saving not successful: ', error) })
        .then(function (result) { return self.fileManager.udpateFileList();})
        .then(function(result) {
          self.getControl('editorWindow').value = null;
          event.target.elements['new-filename'].value = null;
          return self.updateChildren(self.getControl('fileList'), result);
        })
        .catch(function(error) { console.error('File list could not be updated: ', error) });
    });
    return newFileForm;
  });

  /**
   * Deletes the given selected file in the fileList control element.
   * @name deleteButton
   * @kind control element consturctor function
   */
  registerControl('deleteButton', function(self) {
    var deleteButton = self.createDomElement('button', null, 'delete');
    deleteButton.addEventListener('click', function(event) {
      if(self.getControl('fileList').value) {
        self.fileManager.deleteFile(self.getControl('fileList').value)
          .catch( function(error) { console.error('Deleting not successful: ', error) })
          .then(function (result) { return self.fileManager.udpateFileList(); })
          .then(function(result) {
            self.getControl('editorWindow').value = null;
            self.updateChildren(self.getControl('fileList'), result)
          })
          .catch( function(error) { console.error('File list could not updated: ', error) });
      }
    });
    return deleteButton;
  });

  /**
   * Creates a bridge between the FileManager and the ControlElements. Actually build
   * the admin panel's DOM elements from the module level registered elemetent's constructors
   * function and add them to the global DOM.
   *
   * Provides an interface for the control elements and for the fileManager object.
   *
   * @class AdminPanel
   * @param {DOMElement} target The target DOM element to generate the Admin Panel to.
   */
  function AdminPanel(target) {
    /**
     * @property {FileManager} fileManager interface to the FileManager instnace related to this adminPanel instance.
     */
    this.fileManager = new FileManager('/');

    /**
     * @private
     * @property {Object} controls Stores all the control elements, they are DOM elements.
     */
    this.controls = Object.create(null);
    /**
     * @private
     * @type {DOMElement} target Used for store the target DOM element, used for the panel creation.
     */
    this.target = target;

    this.buildControls();
    this.createPanel();
  }

  /**
   * Build DOM elements related to this AdminPanel objects from the Module level
   * registered control elements' constructors. The constructor calls it.
   * @private
   */
  AdminPanel.prototype.buildControls = function () {
    for (var name in registeredControls) {
      this.controls[name] = registeredControls[name](this);
    }
  };

  /**
   * Build the admin panel interface, adds the created DOM elements to the target
   * DOM element.
   * @private
   */
  AdminPanel.prototype.createPanel = function () {
    for (var name in this.controls) {
      this.target.appendChild(this.controls[name]);
    }
  };

  /**
   * A previously registered and built control element can be given by its registered
   * name. The result is a DOM element, possible to reach its state through the DOM
   * interface.
   * @param  {string} name The name of control element to receive, the name same as when its registered.
   * @return {DOMElement}  Returns the built DOM element reference. Able to access its
   */
  AdminPanel.prototype.getControl = function (name) {
    if(!(name in this.controls)) throw new Error('Control haven\'t added yet: ' + name);
    return this.controls[name];
  };

  /**
   * Helper function. Update the option tags in a given parentSelectDomElement
   * which is a select element with the values of a dataArray. The previous content
   * will be deleted.
   *
   * @param  {DOMElement} parentSelectDomElement The SELECT tag to where inject the new data.
   * @param  {Array}      data                   The new data.
   */
  AdminPanel.prototype.updateChildren = function (parentSelectDomElement, data) {
    var self = this;
    parent.innerHTML = null;
    if(data.length > 0) {
      data.forEach(function (element) {
        parent.appendChild(self.createDomElement('option', null, element));
      });
    }
  }

  /**
   * Helper function to create a DOM element tag tagName. In a propertiesObject
   * possible to give any property of the element (e.g: {cols: 50} ). Not obligatory
   * or null can be used instead to skip.
   *
   * The content variable defines the content of the element. If it is a string,
   * a simple text nodewill be created inside the element, if it is a DOM element
   * (for example by another createDomElement function), that element can be added.
   * The contains variable can be repeated anytime as an argument and even not obligatory.
   *
   * @param  {[type]}            name         The tag name of the newly created DOM element.
   * @param  {Object|Null}       [attributes] The attributes of the new DOM element.
   * @param {DOMEelement|String} [element]    Additional DOM elements or strings, will be created as childs.
   * @return {[type]}            [description]
   */
  AdminPanel.prototype.createDomElement = function (name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
      for (var attr in attributes)
        if (attributes.hasOwnProperty(attr))
          node.setAttribute(attr, attributes[attr]);
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (typeof child == "string")
        child = document.createTextNode(child);
      node.appendChild(child);
    }
    return node;
  }

  // * FileManager Prototype

  //  Responsible for the API handling, handle the business model, communicate with
  //  the fileserver. Its sendRequest() method is responsible for the general async
  //  API request handling, some cover functions built for special purpuses.
  //
  //  The methods return a Promise, too to use its results flexible in the
  //  application level by building up chains.
  //


  /**
   * The FileManager provides an interface for the backend API. A FileManager
   * instance is accessible through the AdminPanel instance fileManager property.
   * General in the control element definitions: self.fileManager.
   *
   * All methods returns a Promise which package an async XMLHttpRequest call
   * towards the backend.
   *
   * Some simple console logging is put here also for debugging,
   * and demonstrate the possibilities of chaining. But this is for just this demo,
   * possible to use here some real debugging commands, statistics or background
   * reporting too.
   *
   * These functions throws towards the application level the errors without
   * any modification. The application level's responsibility to decide how to handle
   * the errors by design.
   *
   * @param {String} homeDirectory  The home directory, the files are interrogated from here.
   */
  function FileManager(homeDirectory) {
    this.currentDirectory = homeDirectory;
  }

  // Handle the HTTP async requests, according to given API's HTTP methods.
  /**
   * Generates a Promise with a HTTP request with the given HTTP method, resource,
   * described by path and a given content. Used for general purposes, more
   * specific usage for the methods above.
   *
   * This method doesn't catch any error, the errors are packaged in a promise.
   *
   * @param  {String} method    The HTTP method to use in the request, uppercase. (GET, POST, MKCOL, DELETE)
   * @param  {String} path      The absolute path to the resource to request.
   * @param  [{String} content] The content to send in the body of the request.
   * @return {Promise}          In a case of successful promise it returns a string with the content of the file.
   */
  FileManager.prototype.sendRequest = function(method, path, content) {
    return new Promise(function (succeed, failed) {
      var request = new XMLHttpRequest();
      request.open(method, path, true);
      request.addEventListener('load', function() {
        if(request.status < 400) // The HTTP response's status code indicates no failure.
          succeed(request.responseText);
        else {
          failed(new Error('HTTP error: ' + request.status + ' ' + request.statusText));
        }
      });
      request.addEventListener('error', function(error) {
        failed(new Error('Network error:' + error));
      });
      try {
        request.send(content);
      } catch(error) {
        failed(new Error('Network Error:' + error));
      }
    });
  };

  /**
   * Get the file list of the home directory from the backend. An array will be returned
   * with the name of the files. Subdirectories also came back but not able distinguish
   * what is file what is subdir based on the list.
   *
   * @return {Promise} The success promise returns an Array, the list of the files and directories, strings.
   */
  FileManager.prototype.udpateFileList = function () {
    return this.sendRequest('GET', this.currentDirectory, null).then(function(fileListAsText) {
      if(fileListAsText) {
        return fileListAsText.split("\n");
      } else {
        return [];
      }
    }, function(error) {
      console.error(error);
    });
  };

  /**
   * Load a given content of a fileName and given back as a string.
   * @param  {String} fileName The file to interrogate from the backend, relative to the homedir.
   * @return {Promise}         The string content of the file in a Success promise.
   */
  FileManager.prototype.loadContent = function(fileName) {
    var file = this.currentDirectory + fileName;
    return this.sendRequest('GET', file, null).then(function(fileContent) {
      console.log(file, ' loaded.');
      return fileContent;
    });
  };

  /**
   * Delete a given file from the backend.
   *
   * @param  {String} fileName  Name of the file to delete, relative to homedir.
   * @return {Promise}          The success indicated with the result of the promise.
   */
  FileManager.prototype.deleteFile = function (fileName) {
    var file = this.currentDirectory + fileName;
    return this.sendRequest('DELETE', file, null).then(function() {
      console.log(file, ' deleted!')
    });
  };

/**
 * Overwrite the given fileName on the backend with the given content, if the
 * content is null, the file will be empty. If the fileName is not exists it
 * will be created.
 *
 * @param  {String} fileName  The name of the file to create / overwrite, relative to the current directory.
 * @param  {String} [content] The new file content, or can be null, in this case an empty file will be the result.
 * @return {Promise}          The success or failure is indicated with the Promise.
 */
  FileManager.prototype.saveOrCreateFile = function (fileName, content) {
    var file = this.currentDirectory + fileName
    return this.sendRequest('PUT', file, content).then(function(result) {
      console.log(file, ' saved!')
    });
  };

  return exports;
})(Promise);
