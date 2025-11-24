import { Component } from '@angular/core';


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// This is the same DTO you send to the backend
export interface ShapeDto {
  id: number;
  type: string;

  // colors & styling
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  rotation: number;

  // positioning
  centerX: number;
  centerY: number;
  x: number;
  y: number;
  width: number;
  height: number;

  // radius for circles/ellipses
  radius: number;
  radiusX: number;
  radiusY: number;

  // points for lines/triangles
  points: number[];

  slides_num: number;
}

@Injectable({
  providedIn: 'root'
})
@Component({
  selector: 'app-service',
  imports: [],
  templateUrl: './service.html',
  styleUrl: './service.css',
})

export class Service2 {

  private baseUrl = 'http://localhost:8080/shape';

  constructor(private http: HttpClient) {}

  // Create a new shape
   createShape(dto: ShapeDto): Observable<ShapeDto> {
    return this.http.post<ShapeDto>(`${this.baseUrl}/create`, dto);
  }

  // Change fill color
  changeFillColor(dto: ShapeDto): Observable<any> {
    return  this.http.post(`${this.baseUrl}/changeFillColor`, dto);;
  }

  // Change stroke color
  changeStrokeColor(dto: ShapeDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/changeStrokeColor`, dto);
  }

  // Change stroke width
  changeStrokeWidth(width: number, shapeId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/changeStrokeWidth/${width}/${shapeId}`, {});
  }

  // Rotate shape
  // changeRotation(angle: number, shapeId: string): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/changeRotation?angle=${angle}&shapeId=${shapeId}`, {});
  // }

  // Resize or move shape
  resizeAndMove(dto: ShapeDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/resizeAndMove`, dto);
  }
 copy(dto: ShapeDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/copy`, dto);
  }
  // delete shape
delete(shapeId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/delete/${shapeId}`, {});
}

  // Undo
  undo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/undo`);
  }

  // Redo
  redo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/redo`);
  }
  clear():Observable<any> {
    return this.http.get(`${this.baseUrl}/clear`)
  }

  // Export as JSON file
  exportJson(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/exportJson`, {
      responseType: 'blob'
    });
  }
}


