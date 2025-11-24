import Konva from 'konva';
import { Injectable } from "@angular/core";
import { ShapeDto } from './service/service2';

@Injectable({
  providedIn: 'root'
})





export class MakeDto {

  fromKonva(shape: Konva.Shape): ShapeDto {
    const attrs = shape.attrs;
     let type1 = shape.className; // default
  if (shape.className === 'Line'&& attrs.points?.length === 6) {
    type1 = 'Triangle';
  }
// console.log(shape.className);
console.log( 'id'+ attrs.id2);
    return {
   id: attrs.id2 || 0,
      type: attrs.shapeType   ,             // Rect / Circle / Ellipse / Line / Triangle/Square/
      strokeColor: attrs.stroke || '',   // stroke color
      fillColor: attrs.fill || '',       // fill color
      strokeWidth: attrs.strokeWidth || 0,
      rotation: shape.rotation() || 0,

      centerX: attrs.x + (attrs.width ? attrs.width / 2 : 0),
      centerY: attrs.y + (attrs.height ? attrs.height / 2 : 0),

      x: attrs.x || 0,
      y: attrs.y || 0,
      width: attrs.width || 0,
      height: attrs.height || 0,
      radius: attrs.radius || 0,
      radiusX: attrs.radiusX || 0,
      radiusY: attrs.radiusY || 0,
      points: attrs.points || [],
      slides_num: attrs.slides_num || 0
    };
  
}




}



