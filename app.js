const todo = (state, action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return {
            id: action.id,
            text: action.text,
            completed: false
          };
      case 'TOGGLE_TODO':
        if (state.id !== action.id) {
          return state;
        }

        return {
          ...state,
          completed: !state.completed
        };
      default:
        return state;
    };
  };

  const todos = (state = [], action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          todo(undefined, action)
        ];
      case 'TOGGLE_TODO':
        return state.map(t => todo(t, action));
      default:
        return state;
    };
  };

  const visibilityFilter = (
    state = 'SHOW_ALL',
    action
  ) => {
    switch (action.type) {
      case 'SET_VISIBILITY_FILTER':
        return action.filter;
      default:
        return state;
    };
  };

  //React provides a base class for all components
  const { Component } = React;

  // presentation component
  // Link only specifies the appearance of link when is it active or inactive, but it doesn't
  // know about the behavior
  const Link = ({
    active,
    children,
    onClick
  }) => {
    if (active) {
      return <span>{children}</span>;
    }

    return (
      <a href="#"
        onClick={ e => {
          e.preventDefault();
          onClick();
        }}
      >
        {children}
      </a>
    );
  };

  // container component
  // render the link with the current data from the store
  // provides data and behavior for the presentational component
  class FilterLink extends Component {
    // move the store subscription to this component
    // anytime the store changes we force the update
    // so it can render the current state of the store
    componentDidMount() {
      // similar to clearInterval: subscribe returns a cb for unsubscribing
      this.unsubscribe = store.subscribe(() =>
        this.forceUpdate()
      );
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    render() {
      const props = this.props,
        state = store.getState();

      // delegates all the rendering to the Link presentational component
      // only calculates the props and specifies the cbs that dispatch actions to the store
      return (
        <Link
          active={
            props.filter ===
            state.visibilityFilter
          }
          onClick={() =>
            store.dispatch({
              type: 'SET_VISIBILITY_FILTER',
              filter: props.filter
            })
          }>
          {props.children}
        </Link>
      );
    }
  }

  const getVisibleTodos = (
    todos,
    filter
  ) => {
    switch (filter) {
      case 'SHOW_ALL':
        return todos;
      case 'SHOW_COMPLETED':
        return todos.filter(
          todo => todo.completed
        );
      case 'SHOW_ACTIVE':
        return todos.filter(
          todo => !todo.completed
        );
    };
  };

  let nextTodoId = 0;

  //presentational components
  //they only care about the looks...
  const Todo = ({
    onClick,
    completed,
    text
  }) => (
    <li
      onClick={onClick}
      style={{
        textDecoration:
          completed ?
            'line-through' :
            'none'
      }}>
      {text}
    </li>
  );

  //container components
  //will pass the data of the store and specify the behavior
  const TodoList = ({
    todos,
    onTodoClick
  }) => (
    <ul>
      {todos.map(todo =>
        <Todo
          key={todo.id}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
        />
      )}
    </ul>
  );

  //functional component
  const AddTodo = ({
    onAddClick
  }) => {
    let input;

    return (
      <div>
        <input ref={ node => {
          input = node;
        }} />
        <button onClick={() => {
          if (!input.value) {
            return alert('Missing Todo text');
          }
          //this is the fn we passed as a prop on line 209
          onAddClick(input.value);
          input.value = '';
          console.log(store.getState());
        }}>
          Add Todo
        </button>
      </div>
    );
  };

  //----
  const Footer = () => {
    return (
      <p>
        Show:
        {' '}
        <FilterLink
          filter='SHOW_ALL'>
          ALL
        </FilterLink>
        {' '}
        <FilterLink
          filter='SHOW_ACTIVE'>
          ACTIVE
        </FilterLink>
        {' '}
        <FilterLink
          filter='SHOW_COMPLETED'>
          COMPLETED
        </FilterLink>
      </p>
    );
  };

  //this gets re-rendered everytime the store changes
  //it receives the global state from store.getState()
  const TodoApp = ({
    todos,
    visibilityFilter
  }) => (
    <div>
      <AddTodo
        onAddClick={text =>
          store.dispatch({
            type: 'ADD_TODO',
            id: nextTodoId++,
            text
          })
        }
      />
      <TodoList
        todos={
          //filter and pass the array of todos
          getVisibleTodos(
            todos,
            visibilityFilter
          )
        }
        onTodoClick={id =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id
          })
        }
      />
      <Footer />
    </div>
  );

  const { combineReducers, createStore } = Redux
    ,  todoApp = combineReducers({
      todos,
      visibilityFilter
    })
    ,  store = createStore(todoApp)
    //this will update the DOM on state changes
    , render = () => {
      ReactDOM.render(
        <TodoApp
          {...store.getState()}
        />,
        root
      );
    };

  //the render function listen whenever the store changes
  store.subscribe(render);
  //render initial state
  render();