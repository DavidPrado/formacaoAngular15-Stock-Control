import { GetAllProductsResponse } from './../../models/interfaces/products/response/GetAllProductsResponse';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, map } from 'rxjs';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { EditPorductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { SalePorductRequest } from 'src/app/models/interfaces/products/request/SaleProductRequest';
import { CreateProductResponse } from 'src/app/models/interfaces/products/response/CreateProductResponse';
import { DeleteProductResponse } from 'src/app/models/interfaces/products/response/DeleteProductResponse';
import { SaleProductResponse } from 'src/app/models/interfaces/products/response/SalePorductResponse';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private API_URL = environment.API_URL;
  private JWT_TOKEN= this.cookie.get('USER_INFO');
  private httpOptions ={
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization : `Bearer ${this.JWT_TOKEN}`,

    })
  }

  constructor(
    private http: HttpClient,
    private cookie: CookieService) { }


  getAllProducts(): Observable<Array<GetAllProductsResponse>>{
    return this.http.get<Array<GetAllProductsResponse>>(`${this.API_URL}/products`,
      this.httpOptions
    )
    .pipe(
      map((product) => product.filter((data)=> data.amount > 0))
    );
  }

  deleteProduct(product_id: string): Observable<DeleteProductResponse>{
    return this.http.delete<DeleteProductResponse>(
      `${this.API_URL}/product/delete`,
      {
        ...this.httpOptions,
        params:{
          product_id: product_id
        }
      }
    )
  }

  createProduct(requestDatas: CreateProductRequest): Observable<CreateProductResponse>  {
    return this.http.post<CreateProductResponse>(
      `${this.API_URL}/product`, requestDatas, this.httpOptions
    );
  }

  editProduct(requestDatas: EditPorductRequest): Observable<void>{
    return this.http.put<void>(
      `${this.API_URL}/product/edit`,requestDatas, this.httpOptions
    )
  }

  saleProduct(resquestDatas: SalePorductRequest): Observable<SaleProductResponse>{
    return this.http.put<SaleProductResponse>(
      `${this.API_URL}/product/sale`, {
        amount: resquestDatas?.amount
      }, {
        ...this.httpOptions,
        params:{
          product_id: resquestDatas?.product_id,
        }
      }
    )
  }

}
