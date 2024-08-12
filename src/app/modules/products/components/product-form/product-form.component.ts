import { ProductsService } from './../../../../services/products/products.service';
import { MessageService } from 'primeng/api';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { elements } from 'chart.js';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/products/ProductEvent';
import { EditPorductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { SalePorductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy {

  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public selectedCategory: Array<{name: string; code: string}> = [];

  public productAction!: {
    event: EventAction;
    productDatas: Array<GetAllProductsResponse>;
  }

  public productSelectedDatas!: GetAllProductsResponse;
  public productsDatas: Array<GetAllProductsResponse> = [];
  public addProductForm = this.formBuilder.group({
    name:['', Validators.required],
    price:['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public editProductForm = this.formBuilder.group({
    name:['', Validators.required],
    price:['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required],
  })

  public saleProductForm = this.formBuilder.group({
    amount: [0, Validators.required],
    product_id: ['', Validators.required],
  });

  public saleProductSelected!: GetAllProductsResponse;

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  public renderDropdown = false;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private productsDtSevice: ProductsDataTransferService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    public ref: DynamicDialogConfig
  ){}

  ngOnInit(): void {
    this.productAction = this.ref.data;

    if (this.productAction?.event.action == this.saleProductAction ){
      this.getProductDatas();
    }

    this.getAllCategories();
    this.renderDropdown = true;
  }

  getAllCategories(): void{
    this.categoriesService.getAllCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.categoriesDatas = response;

          if(this.productAction?.event?.action === this.editProductAction && this.productAction?.productDatas){
            this.getProductSelectedDatas(this.productAction?.event.id as string);
          }

        }
      },
    });
  }

  handleSubmitAddProduct(): void{
    if(this.addProductForm?.value && this.addProductForm?.valid){
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount),
      };

      this.productsService.createProduct(requestCreateProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response){
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto criado com sucesso',
              life: 2500,
            });
          }
        }, error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar produto!',
            life: 2500,
          });
        },
      });
    }

    this.addProductForm.reset();
  }


  handleSubmitEditProduct():void{
    if(this.editProductForm.value && this.editProductForm.valid && this.productAction.event.id){
      const resquestEditProduct: EditPorductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        product_id: this.productAction?.event?.id,
        amount: this.editProductForm.value.amount as number,
        category_id:  this.editProductForm.value.category_id as string,
      };

      this.productsService
      .editProduct(resquestEditProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) =>{
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto editado com sucesso',
            life: 2500,
          });
          this.editProductForm.reset();
        }, error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao editar produto!',
            life: 2500,
          });
          this.editProductForm.reset();
        }
      })
    }
  }

  getProductSelectedDatas(productId: String): void{
    const allProducts = this.productAction?.productDatas;

    if(allProducts.length > 0){
      const productFiltered = allProducts.filter((element) => element?.id === productId);
      if (productFiltered){
        this.productSelectedDatas = productFiltered[0];
        this.editProductForm.setValue({
          name: this.productSelectedDatas?.name,
          price: this.productSelectedDatas?.price,
          amount:this.productSelectedDatas?.amount,
          description: this.productSelectedDatas?.description,
          category_id: this.productSelectedDatas?.category?.id,
        });
      }
    }
  }

  getProductDatas(): void {
    this.productsService.getAllProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.productsDatas = response;
          this.productsDatas && this.productsDtSevice.setProductsDatas(this.productsDatas)
        }
      }
    })
  }

  handleSubmitSaleProduct(): void {
    if(this.saleProductForm?.value && this.saleProductForm?.valid){
      const requestDatas: SalePorductRequest = {
        amount: this.saleProductForm.value?.amount as number,
        product_id: this.saleProductForm.value?.product_id as string,
      };

      this.productsService
      .saleProduct(requestDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) =>{
          if(response) {
            this.saleProductForm.reset();
            this.getProductDatas();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Venda efetuada com sucesso',
              life: 2500,
            });
            this.router.navigate(['/dashboard']);
          }
        }, error: (err) =>{
          console.log(err);
          this.saleProductForm.reset();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao vender o produto!',
            life: 2500,
          });
        }
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
