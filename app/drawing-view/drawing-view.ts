import { MakeDto } from './../shape-dto';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import Konva from 'konva';
import { DrawTools, ShapeColor } from '../types/enum';
import { Service } from '../service';
import { Service2 } from '../service/service2';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-drawing-view',
  standalone: true,
  templateUrl: './drawing-view.html',
  styleUrls: ['./drawing-view.css'],
  imports:[HttpClientModule]
})
export class DrawingViewComponent implements AfterViewInit,OnChanges  {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;
  @Input() tool!: DrawTools;

  @Input() outlineColor!: string;
  @Input() backGroundColor!: string;

  @Input() colors!: ShapeColor;
  
 constructor(
    private shapeService: Service2,
    private makeDto: MakeDto

  ) {}

private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private previewShape: Konva.Shape | null = null;
  private startPos = { x: 0, y: 0 };
  private selectedShape: Konva.Shape | null = null;
  private selectionStrokeColor = '#80abdcff';
  private deleteKey = ['Delete', 'Backspace'];
  private transformer!: Konva.Transformer;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['outlineColor']) {
      if (this.selectedShape!==null){

        const shapeId = this.selectedShape.getAttr('id2');
        this.selectedShape?.stroke(this.outlineColor);
     const dto=this.makeDto.fromKonva(this.selectedShape);
 this.shapeService.changeStrokeColor(dto).subscribe({
      next: (res) => console.log('Stroke color updated on server', res),
      error: (err) => console.error('Failed to update stroke color', err),
    });
        this.layer.draw();

      }
      console.log('Outline color changed:', changes['outlineColor'].currentValue);
    }

    if (changes['backGroundColor']) {
       if (this.selectedShape!==null){

        this.selectedShape?.fill(this.backGroundColor);
        const dto=this.makeDto.fromKonva(this.selectedShape);
         this.shapeService.changeFillColor(dto).subscribe({
      next: (res) => console.log('Fill color updated on server', res),
      error: (err) => console.error('Failed to update fill color', err),
    });
        this.layer.draw();

      }
    }
  }
 
  ngAfterViewInit(): void {
     console.log('Component loaded!');
    const { clientWidth, clientHeight } = this.stageContainer.nativeElement;

    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: clientWidth,
      height: clientHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.transformer = new Konva.Transformer({
      enabledAnchors: [
        'top-left',
        'top-center',
        'top-right',

        'middle-left',
        'middle-right',

        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      rotateEnabled: true,
    });
    this.layer.add(this.transformer);
    
    this.stage.on('mousedown touchstart', (e) => this.onPointerDown());
    this.stage.on('mousemove touchmove', (e) => this.onPointerMove());
    this.stage.on('mouseup touchend', (e) => this.onPointerUp());
    this.layer.on('click', (e) => this.onShapeClick(e));
    this.stage.on('click', (e) => {
      if (e.target === this.stage) {
        this.clearSelection();
      }
    });
    
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.transformer.on('transformend', () => {});
    this.wireLayerEvents();
    this.clone();
    
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      }
    });
  }

  private onPointerDown(): void {
    if (!this.shouldDraw()) return;
    
    const pos = this.stage.getPointerPosition();
    if (!pos) return;

    this.startPos = pos;
    this.previewShape = this.createShape(pos.x, pos.y, pos.x, pos.y);
    if (this.previewShape) {
      this.layer.add(this.previewShape);
      this.layer.draw();
    }
  }

  private onPointerMove(): void {
    if (!this.previewShape) return;
    
    const pos = this.stage.getPointerPosition();
    if (!pos) return;
    this.resizeShape(this.previewShape, this.startPos, pos);
    this.layer.batchDraw();
  }

  private onPointerUp(): void {
    const pos = this.stage.getPointerPosition();
    if (!pos) return;
    if(this.startPos.x === pos.x && this.startPos.y === pos.y) {
      this.previewShape?.destroy();
      this.previewShape = null;
      this.layer.draw();
      
      return;
    }
    if (!this.previewShape) return;

  const dto = this.makeDto.fromKonva(this.previewShape);

  this.shapeService.createShape(dto).subscribe({
    next: (res) => {

      const id = res.id;

      this.previewShape?.setAttr('id2', id);

      console.log("backend id inside =", id);
      console.log("konva attr inside =", this.previewShape?.getAttr('id2'));

      this.layer.draw();

      this.previewShape = null;
    },
    error: (err) => {
      console.error("Error creating shape:", err);
    }
  });
    
  }

  private shouldDraw(): boolean {
    return (
      this.tool === DrawTools.Line ||
      this.tool === DrawTools.Rectangle ||
      this.tool === DrawTools.Ellipse ||
      this.tool === DrawTools.Triangle||
       this.tool === DrawTools.circle||
       this.tool==DrawTools.square

    );
  }

  private createShape(x1: number, y1: number, x2: number, y2: number): Konva.Shape | null {
    const stroke = this.colors.outline;
    const fill = this.colors.backGround;

    switch (this.tool) {
      case DrawTools.Line:
        return new Konva.Line({
          points: [x1, y1, x2, y2],
          stroke: stroke,
          strokeWidth: 2,
         shapeType: 'Line'

        });

      case DrawTools.Rectangle:
        return new Konva.Rect({
          x: x1,
          y: y1,
          width: 0,
          height: 0,
          stroke: stroke,
          fill: fill,
          strokeWidth: 2,
          shapeType: 'Rect'

        });

      case DrawTools.Ellipse:
        return new Konva.Ellipse({
          x: x1,
          y: y1,
          radiusX: 0,
          radiusY: 0,
          stroke: stroke,
          fill: fill,
          strokeWidth: 2,
           shapeType: 'Ellipse'

        });

    
     case DrawTools.circle:
      console.log('we create circle ')
    return new Konva.Ellipse({
    x: x1,
    y: y1,
    radiusX: 0,
    radiusY: 0,
    stroke: stroke,
    fill: fill,
    strokeWidth: 2,
    shapeType: 'Circle'

   });

      case DrawTools.Triangle:
        return new Konva.Line({
          points: [x1, y1, x1, y1, x1, y1],
          closed: true,
          stroke: stroke,
          fill: fill,
          strokeWidth: 2,
          shapeType: 'Triangle'
        });


case DrawTools.square:
        return new Konva.Rect({
          x: x1,
    y: y1,
    width: 0,
    height: 0,
    stroke: stroke,
    fill: fill,
    strokeWidth: 2,
    shapeType: 'Square'
        });

      default:
        return null;
    }
  }

  private resizeShape(
    shape: Konva.Shape,
    start: { x: number; y: number },
    pos: { x: number; y: number }
  ) {
    const { x: x1, y: y1 } = start;
    const { x: x2, y: y2 } = pos;

    if (shape instanceof Konva.Line && this.tool === DrawTools.Line) {
      shape.points([x1, y1, x2, y2]);
    }

  
    if (shape instanceof Konva.Ellipse &&this.tool === DrawTools.Ellipse) {
      shape.radiusX(Math.abs(x2 - x1) / 2);
      shape.radiusY(Math.abs(y2 - y1) / 2);
      shape.x((x1 + x2) / 2);
      shape.y((y1 + y2) / 2);
    }

    if (shape instanceof Konva.Line && this.tool === DrawTools.Triangle) {
      shape.points([x1, y2, (x1 + x2) / 2, y1, x2, y2]);
    }
    if (shape instanceof Konva.Ellipse && this.tool === DrawTools.circle) {
  const radius = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;

  shape.radiusX(radius);
  shape.radiusY(radius);

  shape.x((x1 + x2) / 2);
  shape.y((y1 + y2) / 2);
}
  if (shape instanceof Konva.Rect && this.tool === DrawTools.Rectangle) {
      shape.width(x2 - x1);
      shape.height(y2 - y1);
    }


if (shape instanceof Konva.Rect && this.tool === DrawTools.square) {
  const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));

  shape.width(size);
  shape.height(size);

  shape.x(x1);
  shape.y(y1);

  if (x2 < x1) shape.x(x1 - size);
  if (y2 < y1) shape.y(y1 - size);
}

  }



  private onShapeClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (this.tool !== DrawTools.Mouse) return;

    const shape = e.target as Konva.Shape;

    this.selectShape(shape);
  }

  private selectShape(shape: Konva.Shape) {
   
  this.selectedShape = shape;
  shape.draggable(true);
  this.transformer.nodes([shape]);
  this.layer.draw();

  shape.off('dragend');
  shape.off('transformend');

  shape.on('dragend', () => {

    const id = shape.getAttr("id2");
    if (!id) return console.error("Shape missing ID!");

    const dto = this.makeDto.fromKonva(shape);
    dto.id = id;

    console.log("drag dto:", dto);

    this.shapeService.resizeAndMove(dto).subscribe({
      next: (res) => console.log("Move update:", res),
      error: (err) => console.error("Move error:", err),
    });

  });

  shape.on('transformend', () => {

    shape.setAttrs({
      width: shape.width() * shape.scaleX(),
      height: shape.height() * shape.scaleY(),
      scaleX: 1,
      scaleY: 1
    });

    const id = shape.getAttr("id2");
    if (!id) return console.error("Shape missing ID!");

    const dto = this.makeDto.fromKonva(shape);
    dto.id = id;

    console.log("resize dto:", dto);

    this.shapeService.resizeAndMove(dto).subscribe({
      next: (res) => console.log("Resize update:", res),
      error: (err) => console.error("Resize error:", err),
    });

    this.layer.draw();
  });
  }

  private clearSelection() {
    if (!this.selectedShape) return;

    this.selectedShape.draggable(false);
    this.transformer.nodes([]);
    this.selectedShape = null;
    this.layer.draw();
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.selectedShape) return;

    if (this.tool !== DrawTools.Mouse) return;

    if (this.deleteKey.includes(e.key)) {
      const shapeId = this.selectedShape.getAttr('id2');
      if (!shapeId) return console.error("Shape missing ID!");

      this.selectedShape.destroy();
      this.transformer.nodes([]);
      this.selectedShape = null;
      this.layer.draw();

      this.shapeService.delete(shapeId).subscribe({
        next: (res) => console.log("Deleted on server:", res),
        error: (err) => console.error("Delete error:", err),
      });
    }
  }

  // UPDATED UNDO - directly calls backend
  private undo() {
    this.shapeService.undo().subscribe({
      next: (res) => {
        console.log('Undo from server:', res);
        this.applyCommandResult(res);
      },
      error: (err) => console.error('Undo error:', err),
    });
  }

  // UPDATED REDO - directly calls backend
  private redo() {
    this.shapeService.redo().subscribe({
      next: (res) => {
        console.log('Redo from server:', res);
        this.applyCommandResult(res);
      },
      error: (err) => console.error('Redo error:', err),
    });
  }

  private applyCommandResult(res: any) {
    const operationType = res.second; // Pair returns .first and .second
    const shape = res.first;

    if (operationType === 'nothing to undo' || operationType === 'nothing to redo') {
      console.log(operationType);
      return;
    }

    if (operationType === 'changeTo') {
      const existingShape = this.layer.findOne((node: any) => node.attrs.id2 === shape.id);
      if (existingShape) {
        existingShape.setAttrs({
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          radiusX: shape.radiusX,
          radiusY: shape.radiusY,
          stroke: shape.strokeColor,
          fill: shape.fillColor,
          strokeWidth: shape.strokeWidth,
          rotation: shape.rotation,
          points: shape.points,
          centerX: shape.centerX,
          centerY: shape.centerY,
          radius: shape.radius
        });
      }
      this.layer.draw();
    } else if (operationType === 'create') {
      const newShape = this.createShapeFromData(shape);
      if (newShape) {
        newShape.setAttr('id2', shape.id);
        this.layer.add(newShape);
        this.layer.draw();
      }
    } else if (operationType === 'delete') {
      const shapeToDelete = this.layer.findOne((node: any) => node.attrs.id2 === shape.id);
      if (shapeToDelete) {
        shapeToDelete.destroy();
        this.layer.draw();
      }
    }
  }

  private createShapeFromData(shapeData: any): Konva.Shape | null {
    const type = shapeData.type;

    switch (type) {
      case 'Line':
      case 'Triangle':
        return new Konva.Line({
          points: shapeData.points,
          stroke: shapeData.strokeColor,
          fill: shapeData.fillColor,
          strokeWidth: shapeData.strokeWidth,
          closed: shapeData.type === 'Triangle',
          shapeType: type
        });
      case 'Rect':
      case 'Square':
        return new Konva.Rect({
          x: shapeData.x,
          y: shapeData.y,
          width: shapeData.width,
          height: shapeData.height,
          stroke: shapeData.strokeColor,
          fill: shapeData.fillColor,
          strokeWidth: shapeData.strokeWidth,
          shapeType: type
        });
      case 'Ellipse':
      case 'Circle':
        return new Konva.Ellipse({
          x: shapeData.centerX,
          y: shapeData.centerY,
          radiusX: shapeData.radiusX || shapeData.radius,
          radiusY: shapeData.radiusY || shapeData.radius,
          stroke: shapeData.strokeColor,
          fill: shapeData.fillColor,
          strokeWidth: shapeData.strokeWidth,
          shapeType: type
        });
      default:
        return null;
    }
  }

  private wireLayerEvents() {
    this.layer.on('click', (e) => {
      if (this.tool !== DrawTools.Mouse) return;
      if (e.target === this.stage) return this.clearSelection();
      const shape = e.target as Konva.Shape;
      this.selectShape(shape);
    });

    this.layer.on('click', (e) => {
      if (this.tool !== DrawTools.Eraser) return;

      if (e.target === this.stage) return;

      const shape = e.target as Konva.Shape;

      if (this.selectedShape === shape) {
        this.selectedShape = null;
      }

    const shapeId = shape.getAttr('id2');
    if (!shapeId) return console.error("Shape missing ID for delete!");
    
this.shapeService.delete(shapeId).subscribe({
  next: (res) => {
    console.log("Deleted on server:", res);
    shape.destroy();
    this.transformer.nodes([]);
    this.layer.draw();
  },

  error: (err) => {
    console.error("Delete error:", err);
  }
});
    });
  }

private clone(){

  this.layer.on('click', (e) => {
      if (this.tool !== DrawTools.copy) return;

      if (e.target === this.stage) return;

      const shape = e.target as Konva.Shape;
console.log(shape)
    const cloned=  shape.clone()

    cloned.x(shape.x() + 50);
cloned.y(shape.y() + 50);

  const dto = this.makeDto.fromKonva(cloned);


this.shapeService.copy(dto).subscribe({
     next: (res) => {


        cloned.setAttr("id2", res.id);

        this.layer.add(cloned);
        this.layer.draw();
      },
      error: (err) => {
        console.error("Clone backend error:", err);
      }
      
    });

  });
}

importFromFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const json = e.target.result;
      const nodes = JSON.parse(json);

      this.layer.destroyChildren();

      nodes.forEach((shapeData: any) => {
      let shape;
        switch(shapeData.type) {
          case 'Rect':
            shape = new Konva.Rect(shapeData);
            
            break;
          case 'Circle':
            shape = new Konva.Circle(shapeData);
            break;
          case 'Line':
            shape = new Konva.Line(shapeData);
            break;
        }
        if(shape){
        this.layer.add(shape);
        }
      });

      this.layer.draw();
    };

    reader.readAsText(file);
  }

}