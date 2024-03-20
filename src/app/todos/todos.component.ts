import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { APIService, ListTodosQuery, Todo } from '../API.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit, OnDestroy {
  public createForm: FormGroup;
  public updateForm: FormGroup;
  public deleteForm: FormGroup;
  public apiService: APIService;

  /* declare todos variable */
  public todos?: ListTodosQuery;

  private subscriptions: any[] = [];

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      id: ['', Validators.required],
      name: [''],
      description: [''],
    });
    this.deleteForm = this.fb.group({
      id: ['', Validators.required],
    })
    this.apiService = new APIService();
  }

  async ngOnInit() {
    /* fetch todos when app loads */
    try {
      this.todos = await this.apiService.ListTodos();
      console.log('Initial todos: ', this.todos);
    } catch (e) {
      console.log('error fetching todos', e);
    }

    /* subscribe to new todos being created */
    this.subscriptions.push(this.apiService.OnCreateTodoListener().subscribe({
      next: (event) => {
        const newTodo = event.data.onCreateTodo;
        console.log('Received subscription event: ', event);
        console.log('Received new todo being created: ', newTodo);
        if(this.todos) {
          this.todos.items = [newTodo, ...this.todos.items];
        }
      }
    }));
    this.subscriptions.push(this.apiService.OnUpdateTodoListener().subscribe({
      next: async (event) => {
        const updateTodo = event.data.onUpdateTodo;
        console.log('Received subscription event: ', event);
        console.log('Received new todo being updated: ', updateTodo);
        if(this.todos) {
          this.todos = await this.apiService.ListTodos();
        }
      }
    }));
    this.subscriptions.push(this.apiService.OnDeleteTodoListener().subscribe({
      next: async (event) => {
        const deleteTodo = event.data.onDeleteTodo;
        console.log('Received subscription event: ', event);
        console.log('Received new todo being deleted: ', deleteTodo);
        if(this.todos) {
          this.todos = await this.apiService.ListTodos();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }


  public async onCreate(todo: Todo) {
    try {
      const response = await this.apiService.CreateTodo(todo);
      console.log('item created!', response);
    } catch (e) {
      console.log('error creating todo...', e);
    }
  }

  public async onUpdate(todo: Todo) {
    try {
      const response = await this.apiService.UpdateTodo(todo);
      console.log('item updated!', response);
    } catch (e) {
      console.log('error deleting todo...', e);
    }
  }

  public async onDelete(todo: Todo) {
    try {
      const response = await this.apiService.DeleteTodo(todo);
      console.log('item deleted!', response);
    } catch (e) {
      console.log('error deleting todo...', e);
    }
  }
}
