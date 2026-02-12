import type { Question } from '../types';

export const initialQuestions: Question[] = [
  // ===== HTML EASY =====
  { id: 'html-e-1', subject: 'html', difficulty: 'easy', question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperTransfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0 },
  { id: 'html-e-2', subject: 'html', difficulty: 'easy', question: 'Which HTML element is used for the largest heading?', options: ['<heading>', '<h6>', '<h1>', '<head>'], correctAnswer: 2 },
  { id: 'html-e-3', subject: 'html', difficulty: 'easy', question: 'Which tag is used to create a paragraph?', options: ['<para>', '<p>', '<text>', '<pg>'], correctAnswer: 1 },
  { id: 'html-e-4', subject: 'html', difficulty: 'easy', question: 'Which HTML tag is used to insert an image?', options: ['<picture>', '<image>', '<img>', '<photo>'], correctAnswer: 2 },
  { id: 'html-e-5', subject: 'html', difficulty: 'easy', question: 'What is the correct HTML element for inserting a line break?', options: ['<break>', '<lb>', '<newline>', '<br>'], correctAnswer: 3 },
  { id: 'html-e-6', subject: 'html', difficulty: 'easy', question: 'Which tag creates a hyperlink?', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: 1 },
  { id: 'html-e-7', subject: 'html', difficulty: 'easy', question: 'Which tag is used for an unordered list?', options: ['<ol>', '<list>', '<ul>', '<li>'], correctAnswer: 2 },

  // ===== HTML MEDIUM =====
  { id: 'html-m-1', subject: 'html', difficulty: 'medium', question: 'Which HTML element defines the title of a document?', options: ['<meta>', '<head>', '<title>', '<header>'], correctAnswer: 2 },
  { id: 'html-m-2', subject: 'html', difficulty: 'medium', question: 'What is the purpose of the alt attribute in the <img> tag?', options: ['To set image alignment', 'To provide alternative text when image cannot load', 'To set image size', 'To add a tooltip'], correctAnswer: 1 },
  { id: 'html-m-3', subject: 'html', difficulty: 'medium', question: 'Which HTML5 element is used for navigation links?', options: ['<navigation>', '<nav>', '<menu>', '<links>'], correctAnswer: 1 },
  { id: 'html-m-4', subject: 'html', difficulty: 'medium', question: 'Which input type creates a date picker?', options: ['calendar', 'datetime', 'date', 'picker'], correctAnswer: 2 },
  { id: 'html-m-5', subject: 'html', difficulty: 'medium', question: 'What does the <figure> element represent in HTML5?', options: ['An image gallery', 'Self-contained content with optional caption', 'A mathematical figure', 'A diagram only'], correctAnswer: 1 },
  { id: 'html-m-6', subject: 'html', difficulty: 'medium', question: 'Which attribute is used to specify that an input field must be filled out?', options: ['validate', 'required', 'mandatory', 'placeholder'], correctAnswer: 1 },
  { id: 'html-m-7', subject: 'html', difficulty: 'medium', question: 'What is the correct HTML for making a checkbox?', options: ['<input type="check">', '<checkbox>', '<input type="checkbox">', '<check>'], correctAnswer: 2 },

  // ===== HTML HARD =====
  { id: 'html-h-1', subject: 'html', difficulty: 'hard', question: 'What is the Shadow DOM used for?', options: ['Creating shadow effects on elements', 'Encapsulating DOM and styles within a component', 'Hiding elements from the page', 'Server-side rendering'], correctAnswer: 1 },
  { id: 'html-h-2', subject: 'html', difficulty: 'hard', question: 'Which attribute makes an HTML element editable by the user?', options: ['editable', 'contenteditable', 'user-edit', 'canEdit'], correctAnswer: 1 },
  { id: 'html-h-3', subject: 'html', difficulty: 'hard', question: 'What is the purpose of the <template> element in HTML5?', options: ['To create email templates', 'Holds content that is not rendered until activated by JavaScript', 'To define page layout templates', 'To import external HTML files'], correctAnswer: 1 },
  { id: 'html-h-4', subject: 'html', difficulty: 'hard', question: 'What does the defer attribute do in a script tag?', options: ['Downloads script asynchronously', 'Delays script execution until after HTML parsing is complete', 'Defers script to web worker', 'Prevents script from executing'], correctAnswer: 1 },
  { id: 'html-h-5', subject: 'html', difficulty: 'hard', question: 'What is the purpose of the srcset attribute in the <img> tag?', options: ['To set multiple source files for fallback', 'To provide different images for different screen resolutions', 'To preload images', 'To lazy load images'], correctAnswer: 1 },
  { id: 'html-h-6', subject: 'html', difficulty: 'hard', question: 'Which Web API allows you to observe changes to the DOM tree?', options: ['DOMWatcher', 'MutationObserver', 'TreeObserver', 'DOMListener'], correctAnswer: 1 },
  { id: 'html-h-7', subject: 'html', difficulty: 'hard', question: 'What is the purpose of the <slot> element in Web Components?', options: ['To create animation slots', 'To define placeholders for distributable content', 'To reserve memory slots', 'To create input fields'], correctAnswer: 1 },

  // ===== CSS EASY =====
  { id: 'css-e-1', subject: 'css', difficulty: 'easy', question: 'Which property is used to change the text color of an element?', options: ['text-color', 'font-color', 'color', 'foreground'], correctAnswer: 2 },
  { id: 'css-e-2', subject: 'css', difficulty: 'easy', question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Creative Style System', 'Cascading Style Sheets', 'Colorful Style Sheets'], correctAnswer: 2 },
  { id: 'css-e-3', subject: 'css', difficulty: 'easy', question: 'Which property adds space inside an element\'s border?', options: ['margin', 'spacing', 'padding', 'border-space'], correctAnswer: 2 },
  { id: 'css-e-4', subject: 'css', difficulty: 'easy', question: 'How do you select an element with the id "main" in CSS?', options: ['.main', '#main', '*main', 'main'], correctAnswer: 1 },
  { id: 'css-e-5', subject: 'css', difficulty: 'easy', question: 'Which property sets the background color?', options: ['bgcolor', 'color', 'background-color', 'bg'], correctAnswer: 2 },
  { id: 'css-e-6', subject: 'css', difficulty: 'easy', question: 'Which property changes the font size?', options: ['text-size', 'font-style', 'font-size', 'text-style'], correctAnswer: 2 },
  { id: 'css-e-7', subject: 'css', difficulty: 'easy', question: 'How do you select elements with class name "btn"?', options: ['#btn', '.btn', '*btn', 'btn'], correctAnswer: 1 },

  // ===== CSS MEDIUM =====
  { id: 'css-m-1', subject: 'css', difficulty: 'medium', question: 'What is the default value of the position property?', options: ['relative', 'absolute', 'fixed', 'static'], correctAnswer: 3 },
  { id: 'css-m-2', subject: 'css', difficulty: 'medium', question: 'Which property is used to create rounded corners?', options: ['corner-radius', 'border-radius', 'round-corner', 'border-curve'], correctAnswer: 1 },
  { id: 'css-m-3', subject: 'css', difficulty: 'medium', question: 'What does z-index control?', options: ['Zoom level', 'Element opacity', 'The stacking order of positioned elements', 'Element rotation'], correctAnswer: 2 },
  { id: 'css-m-4', subject: 'css', difficulty: 'medium', question: 'Which CSS unit is relative to the root element\'s font-size?', options: ['em', 'px', 'rem', '%'], correctAnswer: 2 },
  { id: 'css-m-5', subject: 'css', difficulty: 'medium', question: 'What is the CSS Box Model composed of (inside out)?', options: ['Border, Padding, Margin, Content', 'Content, Padding, Border, Margin', 'Margin, Border, Content, Padding', 'Content, Border, Padding, Margin'], correctAnswer: 1 },
  { id: 'css-m-6', subject: 'css', difficulty: 'medium', question: 'Which property makes text bold?', options: ['text-weight', 'font-weight', 'font-bold', 'text-bold'], correctAnswer: 1 },
  { id: 'css-m-7', subject: 'css', difficulty: 'medium', question: 'What does "display: flex" do?', options: ['Makes element hidden', 'Creates a flexible box layout', 'Makes element inline', 'Adds flexibility to animations'], correctAnswer: 1 },

  // ===== CSS HARD =====
  { id: 'css-h-1', subject: 'css', difficulty: 'hard', question: 'What is the CSS specificity hierarchy (highest to lowest)?', options: ['Classes > IDs > Elements > Inline', 'Inline styles > IDs > Classes/Attributes > Elements', 'IDs > Inline > Classes > Elements', 'Elements > Classes > IDs > Inline'], correctAnswer: 1 },
  { id: 'css-h-2', subject: 'css', difficulty: 'hard', question: 'What does the CSS calc() function allow you to do?', options: ['Calculate animations', 'Perform mathematical calculations for property values', 'Count DOM elements', 'Calculate page load time'], correctAnswer: 1 },
  { id: 'css-h-3', subject: 'css', difficulty: 'hard', question: 'What is the key difference between CSS Grid and Flexbox?', options: ['Grid is newer than Flexbox', 'Grid is for 2D layouts, Flexbox is for 1D layouts', 'Flexbox is more powerful', 'There is no difference'], correctAnswer: 1 },
  { id: 'css-h-4', subject: 'css', difficulty: 'hard', question: 'What are CSS custom properties (variables)?', options: ['Pre-built CSS values', 'Reusable values defined with -- prefix and accessed with var()', 'JavaScript variables in CSS', 'Sass variables compiled to CSS'], correctAnswer: 1 },
  { id: 'css-h-5', subject: 'css', difficulty: 'hard', question: 'What is the purpose of the @supports at-rule?', options: ['Adding browser support', 'Conditional styling based on browser CSS feature support', 'Supporting multiple stylesheets', 'Media query alternative'], correctAnswer: 1 },
  { id: 'css-h-6', subject: 'css', difficulty: 'hard', question: 'What does the "will-change" property do?', options: ['Changes element dynamically', 'Hints the browser about upcoming changes for optimization', 'Triggers CSS transitions', 'Schedules property changes'], correctAnswer: 1 },
  { id: 'css-h-7', subject: 'css', difficulty: 'hard', question: 'What is a CSS containment and what does "contain: layout" do?', options: ['Contains overflowing content', 'Isolates the layout calculations of an element from the rest of the page', 'Creates a container query', 'Wraps content in a container'], correctAnswer: 1 },

  // ===== JAVASCRIPT EASY =====
  { id: 'js-e-1', subject: 'javascript', difficulty: 'easy', question: 'Which keyword is used to declare a constant variable in JavaScript?', options: ['var', 'let', 'const', 'static'], correctAnswer: 2 },
  { id: 'js-e-2', subject: 'javascript', difficulty: 'easy', question: 'What does console.log() do?', options: ['Creates a log file', 'Outputs a message to the browser console', 'Logs user actions', 'Displays an alert'], correctAnswer: 1 },
  { id: 'js-e-3', subject: 'javascript', difficulty: 'easy', question: 'Which method adds an element to the end of an array?', options: ['append()', 'add()', 'push()', 'insert()'], correctAnswer: 2 },
  { id: 'js-e-4', subject: 'javascript', difficulty: 'easy', question: 'What is the result of typeof null in JavaScript?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctAnswer: 2 },
  { id: 'js-e-5', subject: 'javascript', difficulty: 'easy', question: 'How do you write a single-line comment in JavaScript?', options: ['<!-- comment -->', '/* comment */', '// comment', '# comment'], correctAnswer: 2 },
  { id: 'js-e-6', subject: 'javascript', difficulty: 'easy', question: 'Which operator is used for strict equality?', options: ['==', '===', '!=', '='], correctAnswer: 1 },
  { id: 'js-e-7', subject: 'javascript', difficulty: 'easy', question: 'What does the "length" property of an array return?', options: ['The last index', 'The number of elements', 'The size in bytes', 'The array type'], correctAnswer: 1 },

  // ===== JAVASCRIPT MEDIUM =====
  { id: 'js-m-1', subject: 'javascript', difficulty: 'medium', question: 'What is a closure in JavaScript?', options: ['A way to close the browser', 'A function that has access to variables from its outer (enclosing) scope', 'A method to end a loop', 'A way to close database connections'], correctAnswer: 1 },
  { id: 'js-m-2', subject: 'javascript', difficulty: 'medium', question: 'What does Promise.all() do?', options: ['Creates a new promise', 'Resolves when all promises in the array resolve, or rejects if any rejects', 'Cancels all promises', 'Runs promises sequentially'], correctAnswer: 1 },
  { id: 'js-m-3', subject: 'javascript', difficulty: 'medium', question: 'What is event delegation?', options: ['Assigning events to delegates', 'Handling events on a parent element instead of individual children', 'Removing event listeners', 'Creating custom events'], correctAnswer: 1 },
  { id: 'js-m-4', subject: 'javascript', difficulty: 'medium', question: 'What is the difference between == and === in JavaScript?', options: ['No difference', '=== checks both value and type, == only checks value with coercion', '== is faster', '=== is deprecated'], correctAnswer: 1 },
  { id: 'js-m-5', subject: 'javascript', difficulty: 'medium', question: 'What does the spread operator (...) do?', options: ['Spreads errors across the app', 'Expands an iterable into individual elements', 'Creates a new array', 'Merges two functions'], correctAnswer: 1 },
  { id: 'js-m-6', subject: 'javascript', difficulty: 'medium', question: 'What does Array.prototype.map() return?', options: ['The original array modified', 'A new array with results of calling a function on every element', 'A Map object', 'undefined'], correctAnswer: 1 },
  { id: 'js-m-7', subject: 'javascript', difficulty: 'medium', question: 'What is "hoisting" in JavaScript?', options: ['Lifting DOM elements', 'Moving declarations to the top of their scope before execution', 'Raising errors', 'Promoting variables to global scope'], correctAnswer: 1 },

  // ===== JAVASCRIPT HARD =====
  { id: 'js-h-1', subject: 'javascript', difficulty: 'hard', question: 'What is the JavaScript event loop?', options: ['A type of for loop', 'A mechanism that handles asynchronous callbacks using a call stack and task queue', 'An event handler', 'A loop that listens for DOM events'], correctAnswer: 1 },
  { id: 'js-h-2', subject: 'javascript', difficulty: 'hard', question: 'What is a WeakMap in JavaScript?', options: ['A Map with fewer features', 'A Map where keys are weakly referenced, must be objects, and can be garbage collected', 'A Map that uses less memory', 'A Map that only stores strings'], correctAnswer: 1 },
  { id: 'js-h-3', subject: 'javascript', difficulty: 'hard', question: 'What is the Temporal Dead Zone (TDZ)?', options: ['A timezone handling bug', 'The period between entering scope and variable declaration where let/const cannot be accessed', 'A memory leak zone', 'The time between page loads'], correctAnswer: 1 },
  { id: 'js-h-4', subject: 'javascript', difficulty: 'hard', question: 'What is a generator function in JavaScript?', options: ['A function that generates HTML', 'A function declared with function* that can pause and resume execution using yield', 'A constructor function', 'A function that creates other functions'], correctAnswer: 1 },
  { id: 'js-h-5', subject: 'javascript', difficulty: 'hard', question: 'What does Object.defineProperty() allow you to do?', options: ['Create new objects', 'Define or modify a property with specific descriptors like writable, enumerable, configurable', 'Delete object properties', 'Copy objects'], correctAnswer: 1 },
  { id: 'js-h-6', subject: 'javascript', difficulty: 'hard', question: 'What is the purpose of Symbol in JavaScript?', options: ['Creating icons', 'Creating unique, immutable primitive values often used as object property keys', 'Symbolic math operations', 'String formatting'], correctAnswer: 1 },
  { id: 'js-h-7', subject: 'javascript', difficulty: 'hard', question: 'What is a Proxy object in JavaScript?', options: ['A network proxy', 'An object that wraps another object and intercepts/redefines fundamental operations', 'A copy of an object', 'A deprecated feature'], correctAnswer: 1 },

  // ===== PYTHON EASY =====
  { id: 'py-e-1', subject: 'python', difficulty: 'easy', question: 'How do you output text in Python?', options: ['echo()', 'console.log()', 'print()', 'System.out.println()'], correctAnswer: 2 },
  { id: 'py-e-2', subject: 'python', difficulty: 'easy', question: 'Which keyword is used to define a function in Python?', options: ['function', 'func', 'def', 'define'], correctAnswer: 2 },
  { id: 'py-e-3', subject: 'python', difficulty: 'easy', question: 'What is the correct file extension for Python files?', options: ['.python', '.pt', '.pyt', '.py'], correctAnswer: 3 },
  { id: 'py-e-4', subject: 'python', difficulty: 'easy', question: 'How do you create a list in Python?', options: ['list()', 'Using curly braces {}', 'Using square brackets []', 'Using parentheses ()'], correctAnswer: 2 },
  { id: 'py-e-5', subject: 'python', difficulty: 'easy', question: 'Which keyword is used for conditional statements in Python?', options: ['switch', 'case', 'if', 'when'], correctAnswer: 2 },
  { id: 'py-e-6', subject: 'python', difficulty: 'easy', question: 'How do you start a comment in Python?', options: ['//', '/*', '#', '--'], correctAnswer: 2 },
  { id: 'py-e-7', subject: 'python', difficulty: 'easy', question: 'Which keyword is used for loops that iterate over a sequence?', options: ['foreach', 'loop', 'for', 'iterate'], correctAnswer: 2 },

  // ===== PYTHON MEDIUM =====
  { id: 'py-m-1', subject: 'python', difficulty: 'medium', question: 'What is a list comprehension in Python?', options: ['A way to understand lists', 'A concise way to create lists using a single expression', 'A list sorting method', 'A type of linked list'], correctAnswer: 1 },
  { id: 'py-m-2', subject: 'python', difficulty: 'medium', question: 'What does *args do in a function definition?', options: ['Creates argument errors', 'Allows the function to accept any number of positional arguments as a tuple', 'Multiplies arguments', 'Makes arguments optional'], correctAnswer: 1 },
  { id: 'py-m-3', subject: 'python', difficulty: 'medium', question: 'What is the difference between a list and a tuple in Python?', options: ['No difference', 'Lists are mutable, tuples are immutable', 'Tuples are faster', 'Lists can only hold strings'], correctAnswer: 1 },
  { id: 'py-m-4', subject: 'python', difficulty: 'medium', question: 'What does the "with" statement do in Python?', options: ['Imports modules', 'Provides a context manager for automatic resource management', 'Creates aliases', 'Defines scope'], correctAnswer: 1 },
  { id: 'py-m-5', subject: 'python', difficulty: 'medium', question: 'What is PEP 8?', options: ['A Python library', 'The official style guide for writing Python code', 'A Python version', 'A testing framework'], correctAnswer: 1 },
  { id: 'py-m-6', subject: 'python', difficulty: 'medium', question: 'What does the "lambda" keyword create?', options: ['A new class', 'An anonymous (unnamed) function', 'A loop', 'A variable'], correctAnswer: 1 },
  { id: 'py-m-7', subject: 'python', difficulty: 'medium', question: 'What is a dictionary in Python?', options: ['A word lookup tool', 'A collection of key-value pairs enclosed in curly braces', 'An ordered list', 'A text file'], correctAnswer: 1 },

  // ===== PYTHON HARD =====
  { id: 'py-h-1', subject: 'python', difficulty: 'hard', question: 'What are metaclasses in Python?', options: ['A type of inheritance', 'Classes whose instances are themselves classes, controlling class creation', 'Abstract classes', 'Deprecated feature'], correctAnswer: 1 },
  { id: 'py-h-2', subject: 'python', difficulty: 'hard', question: 'What is the GIL (Global Interpreter Lock) in CPython?', options: ['A security feature', 'A mutex that allows only one thread to execute Python bytecode at a time', 'A garbage collector', 'A file locking mechanism'], correctAnswer: 1 },
  { id: 'py-h-3', subject: 'python', difficulty: 'hard', question: 'What is a decorator in Python?', options: ['A design pattern only', 'A function/class that modifies the behavior of another function or class using @syntax', 'A CSS-like styling for Python', 'A documentation tool'], correctAnswer: 1 },
  { id: 'py-h-4', subject: 'python', difficulty: 'hard', question: 'What is the MRO (Method Resolution Order) in Python?', options: ['Module loading order', 'The order in which base classes are searched when executing a method (C3 linearization)', 'Method return order', 'Memory reclamation order'], correctAnswer: 1 },
  { id: 'py-h-5', subject: 'python', difficulty: 'hard', question: 'What are coroutines in Python?', options: ['Multi-threaded functions', 'Functions that can suspend and resume execution, used with async/await', 'Core library routines', 'Recursive functions'], correctAnswer: 1 },
  { id: 'py-h-6', subject: 'python', difficulty: 'hard', question: 'What is the descriptor protocol in Python?', options: ['A network protocol', 'A protocol where objects define __get__, __set__, __delete__ to customize attribute access', 'A file format', 'A serialization method'], correctAnswer: 1 },
  { id: 'py-h-7', subject: 'python', difficulty: 'hard', question: 'What does __slots__ do in a Python class?', options: ['Creates time slots', 'Restricts instance attributes to declared names, saving memory by avoiding __dict__', 'Defines method slots', 'Creates database slots'], correctAnswer: 1 },

  // ===== C# EASY =====
  { id: 'cs-e-1', subject: 'csharp', difficulty: 'easy', question: 'Which keyword is used to declare a class in C#?', options: ['struct', 'object', 'class', 'type'], correctAnswer: 2 },
  { id: 'cs-e-2', subject: 'csharp', difficulty: 'easy', question: 'What is the entry point of a C# console application?', options: ['Start()', 'Run()', 'Main()', 'Begin()'], correctAnswer: 2 },
  { id: 'cs-e-3', subject: 'csharp', difficulty: 'easy', question: 'Which data type is used to store text in C#?', options: ['text', 'char', 'string', 'varchar'], correctAnswer: 2 },
  { id: 'cs-e-4', subject: 'csharp', difficulty: 'easy', question: 'How do you write a single-line comment in C#?', options: ['# comment', '<!-- comment -->', '// comment', '** comment'], correctAnswer: 2 },
  { id: 'cs-e-5', subject: 'csharp', difficulty: 'easy', question: 'Which keyword is used to create a new object instance?', options: ['create', 'instance', 'new', 'init'], correctAnswer: 2 },
  { id: 'cs-e-6', subject: 'csharp', difficulty: 'easy', question: 'Which keyword is used to define a namespace?', options: ['module', 'package', 'namespace', 'scope'], correctAnswer: 2 },
  { id: 'cs-e-7', subject: 'csharp', difficulty: 'easy', question: 'What is the keyword for boolean true in C#?', options: ['TRUE', 'True', 'true', 'yes'], correctAnswer: 2 },

  // ===== C# MEDIUM =====
  { id: 'cs-m-1', subject: 'csharp', difficulty: 'medium', question: 'What is an interface in C#?', options: ['A graphical user interface', 'A contract that defines methods and properties a class must implement', 'A type of class', 'A database connection'], correctAnswer: 1 },
  { id: 'cs-m-2', subject: 'csharp', difficulty: 'medium', question: 'What is the difference between a struct and a class in C#?', options: ['No difference', 'Structs are value types stored on stack, classes are reference types on heap', 'Structs are faster', 'Classes cannot have methods'], correctAnswer: 1 },
  { id: 'cs-m-3', subject: 'csharp', difficulty: 'medium', question: 'What does the "virtual" keyword do in C#?', options: ['Creates virtual memory', 'Allows a method to be overridden in derived classes', 'Makes a method static', 'Creates a virtual machine'], correctAnswer: 1 },
  { id: 'cs-m-4', subject: 'csharp', difficulty: 'medium', question: 'What is LINQ in C#?', options: ['A web framework', 'Language Integrated Query - query capabilities built into C#', 'A testing library', 'A database engine'], correctAnswer: 1 },
  { id: 'cs-m-5', subject: 'csharp', difficulty: 'medium', question: 'What is a delegate in C#?', options: ['A design pattern', 'A type-safe reference to a method or group of methods', 'A thread manager', 'An event handler only'], correctAnswer: 1 },
  { id: 'cs-m-6', subject: 'csharp', difficulty: 'medium', question: 'What is the purpose of the "sealed" keyword?', options: ['Encrypts a class', 'Prevents a class from being inherited', 'Locks a variable', 'Closes a file'], correctAnswer: 1 },
  { id: 'cs-m-7', subject: 'csharp', difficulty: 'medium', question: 'What are properties in C#?', options: ['CSS properties', 'Members that provide a mechanism to read, write, or compute private field values', 'Configuration settings', 'Database columns'], correctAnswer: 1 },

  // ===== C# HARD =====
  { id: 'cs-h-1', subject: 'csharp', difficulty: 'hard', question: 'What is reflection in C#?', options: ['Mirror imaging of objects', 'The ability to inspect and manipulate type metadata and objects at runtime', 'A debugging technique', 'Code review process'], correctAnswer: 1 },
  { id: 'cs-h-2', subject: 'csharp', difficulty: 'hard', question: 'What is the async/await pattern in C#?', options: ['Multi-threading', 'A pattern for writing non-blocking asynchronous code that reads like synchronous code', 'Parallel processing', 'Event-driven architecture'], correctAnswer: 1 },
  { id: 'cs-h-3', subject: 'csharp', difficulty: 'hard', question: 'What is the difference between Task and Thread in C#?', options: ['They are the same', 'Task is a higher-level abstraction using the thread pool, Thread is a low-level OS thread', 'Thread is newer', 'Task is synchronous'], correctAnswer: 1 },
  { id: 'cs-h-4', subject: 'csharp', difficulty: 'hard', question: 'What is dependency injection in C#?', options: ['Installing NuGet packages', 'A design pattern that provides dependencies to objects rather than having them create dependencies', 'Injecting code at runtime', 'Dynamic linking'], correctAnswer: 1 },
  { id: 'cs-h-5', subject: 'csharp', difficulty: 'hard', question: 'What is the purpose of the "using" statement in C#?', options: ['Importing namespaces only', 'Ensures IDisposable resources are properly disposed when no longer needed', 'Creating aliases', 'Defining scope'], correctAnswer: 1 },
  { id: 'cs-h-6', subject: 'csharp', difficulty: 'hard', question: 'What are covariance and contravariance in C# generics?', options: ['Type casting methods', 'Covariance allows using a more derived type, contravariance allows a less derived type in generic type parameters', 'Error handling patterns', 'Memory management techniques'], correctAnswer: 1 },
  { id: 'cs-h-7', subject: 'csharp', difficulty: 'hard', question: 'What is the Span<T> type in C#?', options: ['A UI component', 'A type-safe, memory-safe view over contiguous memory without heap allocation', 'A collection type', 'A string format'], correctAnswer: 1 },
];
