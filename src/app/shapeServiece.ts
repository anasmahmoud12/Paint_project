// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';

// // This is the same DTO you send to the backend
// export interface ShapeDto {
//   id:number
// type:string;
// x:number;
// y:number;
// width:number;
// height:number;
// radius:number;
// radiusX:number;
// radiusY:number;
// points:number[];
// slides_num:number;

// }

// @Injectable({
//   providedIn: 'root'
// })
// export class ShapeService {

//   private baseUrl = 'http://localhost:8080/shape';

//   constructor(private http: HttpClient) {}

//   // Create a new shape
//   createShape(dto: ShapeDto): Observable<any> {
//     return this.http.post(`${this.baseUrl}/create`, dto);
//   }

//   // Change fill color
//   changeFillColor(color: string, shapeId: number): Observable<any> {
//     return this.http.post(`${this.baseUrl}/changeFillColor/${color}/${shapeId}`, {});
//   }

//   // Change stroke color
//   changeStrokeColor(color: string, shapeId: number): Observable<any> {
//     return this.http.post(`${this.baseUrl}/changeStrokeColor/${color}/${shapeId}`, {});
//   }

//   // Change stroke width
//   changeStrokeWidth(width: number, shapeId: number): Observable<any> {
//     return this.http.post(`${this.baseUrl}/changeStrokeWidth/${width}/${shapeId}`, {});
//   }

//   // Rotate shape
//   changeRotation(angle: number, shapeId: number): Observable<any> {
//     return this.http.post(`${this.baseUrl}/changeRotation?angle=${angle}&shapeId=${shapeId}`, {});
//   }

//   // Resize or move shape
//   resizeAndMove(dto: ShapeDto): Observable<any> {
//     return this.http.post(`${this.baseUrl}/resizeAndMove`, dto);
//   }

//   // Copy shape
//   copy(shapeId: number): Observable<any> {
//     return this.http.post(`${this.baseUrl}/copy?shapeId=${shapeId}`, {});
//   }

//   // Undo
//   undo(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/undo`);
//   }

//   // Redo
//   redo(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/redo`);
//   }

//   // Export as JSON file
//   exportJson(): Observable<Blob> {
//     return this.http.get(`${this.baseUrl}/exportJson`, {
//       responseType: 'blob'
//     });
//   }
// }
