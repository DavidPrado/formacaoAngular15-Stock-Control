import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { DeleteCategoryAction } from 'src/app/models/enums/categories/DeleteCategoryAction';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy{

  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  private ref!: DynamicDialogRef;

  constructor(
    private categoriesService: CategoriesService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ){}


  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesService.getAllCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) =>{
        if(response.length > 0){
          this.categoriesDatas = response;
        }
      }, error: (err) => {
        console.log(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao buscar categorias',
          life: 2500,
        });
        this.router.navigate(['/dashboard'])
      }
    })
  }

  handleDeleteCategoryAction(event: DeleteCategoryAction): void{
    if(event){
      this.confirmationService.confirm({
        message: `Comfirma a exclusão da categoria: ${event?.categoryName}`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteCategory(event?.category_id),
      })
    }

  }

  deleteCategory(category_id: string) : void {
      if(category_id){
        this.categoriesService.deleteCategory({category_id})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) =>{
            this.getAllCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria removida com sucesso!',
              life: 3000,
            });
          }, error: (err) => {
            console.log(err);
            this.getAllCategories();
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao remover a categoria!',
              life: 3000,
            });
          }
        });

      }
  }

  handleCategoryAction(event: EventAction): void {
    if(event){
      this.ref = this.dialogService.open(CategoryFormComponent, {
        header: event?.action,
        width: '70%',
        contentStyle: {overflow: 'auto'},
        baseZIndex: 10000,
        maximizable: true,
        data: {
          event: event,
        },
      });

      this.ref.onClose
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.getAllCategories(),
      })

    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
