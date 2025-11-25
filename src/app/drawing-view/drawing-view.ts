import { MakeDto } from './../shape-dto';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
export class DrawingViewComponent implements AfterViewInit,OnChanges,OnInit   {
  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;
  @Input() tool!: DrawTools;
  @Input() toolTrigger!: number;
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


ngOnInit () {
  this.shapeService.clear().subscribe();
}

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

    if (changes['toolTrigger']) {
              this.clearSelection();

       if(this.tool==DrawTools.exportJson){
        this.exportJson()
       }

       if(this.tool==DrawTools.importJson){
        this.import()
       }
        if(this.tool==DrawTools.XML){
        this.exportXml()
       }
    }
  }



private async exportJson() {
  console.log('Exporting JSON');
  
  this.shapeService.exportJson().subscribe({
    next: async (blob) => {
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: 'shapes.json',
            types: [{
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('JSON file saved successfully');
          alert('File saved successfully!');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Save file error:', err);
            this.fallbackDownload(blob, 'shapes.json');
          }
        }
      } else {
        console.log('File System Access API not supported, using fallback download');
        this.fallbackDownload(blob, 'shapes.json');
      }
    },
    error: (err) => {
      console.error('Export JSON error:', err);
    }
  });
}

private fallbackDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
  console.log('File downloaded using fallback method');
}

private async exportXml() {
  console.log('Exporting XML...');
  
  this.shapeService.exportXml().subscribe({
    next: async (blob) => {
      // Try to use File System Access API (Chrome 86+, Edge 86+)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: 'shapes.xml',
            types: [{
              description: 'XML Files',
              accept: { 'text/xml': ['.xml'] }
            }]
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log('XML file saved successfully');
          alert('File saved successfully!');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Save file error:', err);
            this.fallbackDownload(blob, 'shapes.xml');
          }
        }
      } else {
        console.log('File System Access API not supported, using fallback download');
        this.fallbackDownload(blob, 'shapes.xml');
      }
    },
    error: (err) => {
      console.error('Export XML error:', err);
    }
  });
}

private import() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.xml,application/json,text/xml'; 
  
  input.onchange = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.json')) {
      this.importJson(file);
    } else if (fileName.endsWith('.xml')) {
      this.importXml(file);
    } else {
      console.error('Unsupported file type. Please select a .json or .xml file');
      alert('Unsupported file type. Please select a .json or .xml file');
    }
  };
  
  // Trigger file picker
  input.click();
}

private importJson(file: File) {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    try {
      const shapes = JSON.parse(e.target.result);
      
      if (!Array.isArray(shapes)) {
        console.error('Invalid JSON format: expected array of shapes');
        alert('Invalid JSON format: expected array of shapes');
        return;
      }
      
      // Clear only shapes, not transformer
      const children = this.layer.children?.slice() || [];
      children.forEach((child: any) => {
        if (child !== this.transformer) {
          child.destroy();
        }
      });
      
      this.layer.draw();
      
      // Import each shape
      this.importShapesSequentially(shapes, 0);
      
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      alert('Failed to parse JSON file. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
}

private importXml(file: File) {
  const reader = new FileReader();
  reader.onload = (e: any) => {
    try {
      const xmlText = e.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.error('XML parsing error:', parserError.textContent);
        alert('Failed to parse XML file. Please check the file format.');
        return;
      }
      
      // Extract shapes from XML
      const shapes = this.parseXmlShapes(xmlDoc);
      
      if (!shapes || shapes.length === 0) {
        console.error('No shapes found in XML file');
        alert('No shapes found in XML file');
        return;
      }
      
      // Clear only shapes, not transformer
      const children = this.layer.children?.slice() || [];
      children.forEach((child: any) => {
        if (child !== this.transformer) {
          child.destroy();
        }
      });
      
      this.layer.draw();
      
      // Import each shape
      this.importShapesSequentially(shapes, 0);
      
    } catch (err) {
      console.error('Failed to parse XML:', err);
      alert('Failed to parse XML file. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
}

private parseXmlShapes(xmlDoc: Document): any[] {
  const shapes: any[] = [];
  
  // Try different XML structures (both <item> and <shape> tags)
  let shapeElements = xmlDoc.querySelectorAll('item');
  if (shapeElements.length === 0) {
    shapeElements = xmlDoc.querySelectorAll('shape');
  }
  
  console.log(`Found ${shapeElements.length} shapes in XML`);
  
  shapeElements.forEach((shapeEl, index) => {
    const shape: any = {};
    
    // Parse all child elements as properties
    shapeEl.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const key = element.tagName;
        const value = element.textContent?.trim() || '';
        
        // Convert value to appropriate type
        if (key === 'points') {
          // Parse points array: "1,2,3,4" -> [1, 2, 3, 4]
          shape[key] = value.split(',').map(p => parseFloat(p.trim()));
        } else if (key === 'type' || key === 'strokeColor' || key === 'fillColor') {
          // Keep as string
          shape[key] = value;
        } else if (key === 'id') {
          // Skip the old id, let backend generate new one
          // Don't include it in the shape object
        } else {
          // Try to parse as number, otherwise keep as string
          const numValue = parseFloat(value);
          shape[key] = isNaN(numValue) ? value : numValue;
        }
      }
    });
    
    console.log(`Parsed shape ${index + 1}:`, shape);
    
    if (shape.type) {
      shapes.push(shape);
    } else {
      console.warn(`Shape ${index + 1} missing type, skipping`);
    }
  });
  
  return shapes;
}

private importShapesSequentially(shapes: any[], index: number) {
  if (index >= shapes.length) {
    console.log('All shapes imported successfully');
    alert(`Successfully imported ${shapes.length} shape(s)`);
    return;
  }
  
  const shapeData = shapes[index];
  
  // Create Konva shape from data
  const konvaShape = this.createShapeFromData(shapeData);
  
  if (!konvaShape) {
    console.error('Failed to create shape from data:', shapeData);
    this.importShapesSequentially(shapes, index + 1);
    return;
  }
  
  // Convert to DTO for backend
  const dto = this.makeDto.fromKonva(konvaShape);
  
  // Send to backend
  this.shapeService.createShape(dto).subscribe({
    next: (res) => {
      // Set backend ID on the Konva shape
      konvaShape.setAttr('id2', res.id);
      
      // Add to layer
      this.layer.add(konvaShape);
      this.layer.draw();
      
      console.log(`Shape ${index + 1}/${shapes.length} imported:`, res.id);
      
      // Import next shape
      this.importShapesSequentially(shapes, index + 1);
    },
    error: (err) => {
      console.error(`Failed to create shape ${index + 1}:`, err);
      
      // Continue with next shape even if this one failed
      this.importShapesSequentially(shapes, index + 1);
    }
  });
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
      const width = x2 - x1;
      const height = y2 - y1;
      
      // Calculate triangle points based on drag direction
      const left = Math.min(x1, x2);
      const right = Math.max(x1, x2);
      const top = Math.min(y1, y2);
      const bottom = Math.max(y1, y2);
      const centerX = (left + right) / 2;
      
      // Triangle points: bottom-left, top-center, bottom-right
      shape.points([
        left, bottom,      // bottom-left
        centerX, top,      // top-center
        right, bottom      // bottom-right
      ]);
    }
    
    if (shape instanceof Konva.Ellipse && this.tool === DrawTools.circle) {
      const radius = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;

      shape.radiusX(radius);
      shape.radiusY(radius);

      shape.x((x1 + x2) / 2);
      shape.y((y1 + y2) / 2);
    }
    
    if (shape instanceof Konva.Rect && this.tool === DrawTools.Rectangle) {
      const width = x2 - x1;
      const height = y2 - y1;
      
      shape.width(Math.abs(width));
      shape.height(Math.abs(height));
      
      if (width < 0) shape.x(x2);
      else shape.x(x1);
      
      if (height < 0) shape.y(y2);
      else shape.y(y1);
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
  
  // Check if shape should maintain aspect ratio (Circle or Square)
  const shapeType = shape.getAttr('shapeType');
  const shouldKeepRatio = shapeType === 'Circle' || shapeType === 'Square';
  
  // Configure transformer based on shape type
  this.transformer.nodes([shape]);
  
  // Enable aspect ratio locking for circles and squares
  if (shouldKeepRatio) {
    this.transformer.keepRatio(true);
    this.transformer.enabledAnchors([
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ]);
  } else {
    this.transformer.keepRatio(false);
    this.transformer.enabledAnchors([
      'top-left',
      'top-center',
      'top-right',
      'middle-left',
      'middle-right',
      'bottom-left',
      'bottom-center',
      'bottom-right'
    ]);
  }
  
  this.layer.draw();

  shape.off('dragend');
  shape.off('transformend');

  shape.on('dragend', () => {
    const id = shape.getAttr("id2");
    if (!id) return console.error("Shape missing ID!");

    // For Line/Triangle, apply position offset to points
    if (shape instanceof Konva.Line) {
      const points = shape.points();
      const offsetX = shape.x();
      const offsetY = shape.y();
      
      // Convert relative points to absolute coordinates
      const absolutePoints = points.map((coord, index) => {
        return index % 2 === 0 ? coord + offsetX : coord + offsetY;
      });
      
      // Update the shape with absolute points and reset position
      shape.setAttrs({
        points: absolutePoints,
        x: 0,
        y: 0
      });
    }

    const dto = this.makeDto.fromKonva(shape);
    dto.id = id;

    console.log("drag dto:", dto);

    this.shapeService.resizeAndMove(dto).subscribe({
      next: (res) => console.log("Move update:", res),
      error: (err) => console.error("Move error:", err),
    });
  });

  shape.on('transformend', () => {
    const shapeType = shape.getAttr('shapeType');
    
    if (shape instanceof Konva.Line) {
      // Handle Line/Triangle transforms
      const points = shape.points();
      const scaleX = shape.scaleX();
      const scaleY = shape.scaleY();
      const offsetX = shape.x();
      const offsetY = shape.y();
      const rotation = shape.rotation();
      
      // FIXED: Apply both scale AND position offset to points
      const transformedPoints = points.map((coord, index) => {
        const scaled = index % 2 === 0 ? coord * scaleX : coord * scaleY;
        const offset = index % 2 === 0 ? offsetX : offsetY;
        return scaled + offset;
      });
      
      // Reset all transforms to identity
      shape.setAttrs({
        points: transformedPoints,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0  // Reset rotation as it's applied to points
      });
      
    } else if (shape instanceof Konva.Ellipse) {
      // Handle Ellipse/Circle transforms
      const scaleX = shape.scaleX();
      const scaleY = shape.scaleY();
      
      if (shapeType === 'Circle') {
        // For circles, use the average scale to maintain perfect circle
        const avgScale = (scaleX + scaleY) / 2;
        shape.setAttrs({
          radiusX: shape.radiusX() * avgScale,
          radiusY: shape.radiusY() * avgScale,
          scaleX: 1,
          scaleY: 1
        });
      } else {
        // For ellipses, scale normally
        shape.setAttrs({
          radiusX: shape.radiusX() * scaleX,
          radiusY: shape.radiusY() * scaleY,
          scaleX: 1,
          scaleY: 1
        });
      }
    } else if (shape instanceof Konva.Rect) {
      // Handle Rect/Square transforms
      const scaleX = shape.scaleX();
      const scaleY = shape.scaleY();
      
      if (shapeType === 'Square') {
        // For squares, use the larger scale to maintain perfect square
        const newSize = Math.max(shape.width() * scaleX, shape.height() * scaleY);
        shape.setAttrs({
          width: newSize,
          height: newSize,
          scaleX: 1,
          scaleY: 1
        });
      } else {
        // For rectangles, scale normally
        shape.setAttrs({
          width: shape.width() * scaleX,
          height: shape.height() * scaleY,
          scaleX: 1,
          scaleY: 1
        });
      }
    }

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

  private undo() {
    this.shapeService.undo().subscribe({
      next: (res) => {
        console.log('Undo from server:', res);
        console.log('make undo');
        
        this.clearSelection();
        this.applyCommandResult(res);
      },
      error: (err) => console.error('Undo error:', err),
    });
  }

  private redo() {
    this.shapeService.redo().subscribe({
      next: (res) => {
        console.log('Redo from server:', res);
        
        this.clearSelection();
        this.applyCommandResult(res);
      },
      error: (err) => console.error('Redo error:', err),
    });
  }

  private applyCommandResult(res: any) {
    let operationType = res.operation;
    let shape = res.shape;
console.log( 'shape you want ',shape)


    if (operationType === 'nothing to undo' || operationType === 'nothing to redo') {
      console.log(operationType);
      return;
    }

    if (operationType === 'changeTo') {
      const existingShape = this.layer.children!.find((node: any) => node.attrs?.id2 === shape.id);
      
      if (existingShape) {
        console.log('updating existing shape:', shape.id);
        
        const updateAttrs: any = {};

        if (existingShape instanceof Konva.Ellipse) {
          if (shape.centerX !== undefined) updateAttrs.x = shape.centerX;
          else if (shape.x !== undefined) updateAttrs.x = shape.x;
          
          if (shape.centerY !== undefined) updateAttrs.y = shape.centerY;
          else if (shape.y !== undefined) updateAttrs.y = shape.y;
          
          if (shape.radiusX !== undefined) updateAttrs.radiusX = shape.radiusX;
          if (shape.radiusY !== undefined) updateAttrs.radiusY = shape.radiusY;
          if (shape.radius !== undefined) {
            updateAttrs.radiusX = shape.radius;
            updateAttrs.radiusY = shape.radius;
          }
        } else {
          if (shape.x !== undefined) updateAttrs.x = shape.x;
          if (shape.y !== undefined) updateAttrs.y = shape.y;
        }

        if (shape.strokeColor !== undefined) updateAttrs.stroke = shape.strokeColor;
        if (shape.fillColor !== undefined) updateAttrs.fill = shape.fillColor;
        if (shape.rotation !== undefined) updateAttrs.rotation = shape.rotation;
        if (shape.strokeWidth !== undefined) updateAttrs.strokeWidth = shape.strokeWidth;

        if (existingShape instanceof Konva.Rect) {
          if (shape.width !== undefined) updateAttrs.width = shape.width;
          if (shape.height !== undefined) updateAttrs.height = shape.height;
        } else if (existingShape instanceof Konva.Line) {
          if (shape.points !== undefined) updateAttrs.points = shape.points;
        }

        existingShape.setAttrs(updateAttrs);
      } else {
        console.warn('Shape not found for update, ID:', shape.id);
      }
      this.layer.draw();
    } else if (operationType === 'create') {
      console.log('creating new shape:', shape.id);
      
      const existingShape = this.layer.children!.find((node: any) => node.attrs?.id2 === shape.id);
      
      if (existingShape) {
        console.log('shape already exists, skipping create:', shape.id);
        return;
      }
      
      const newShape = this.createShapeFromData(shape);
      if (newShape) {
        newShape.setAttr('id2', shape.id);
        console.log(newShape);
        this.layer.add(newShape);
        this.layer.draw();
      } else {
        console.error('Failed to create shape from data:', shape);
      }
    } else if (operationType === 'delete') {
      console.log('Deleting shape:', shape.id);
      
      const shapeToDelete = this.layer.children!.find((node: any) => node.attrs?.id2 === shape.id);
      if (shapeToDelete) {
        shapeToDelete.destroy();
        this.layer.draw();
      } else {
        console.warn('Shape not found for deletion, ID:', shape.id);
      }
    } else {
      console.error('Unknown operation type:', operationType);
    }
  }

  private createShapeFromData(shapeData: any): Konva.Shape | null {
    const type = shapeData.type;

    console.log('Creating shape from data, type:', type, 'data:', shapeData);

    switch (type) {
      case 'Line':
      case 'Triangle':
        return new Konva.Line({
          points: shapeData.points || [],
          stroke: shapeData.strokeColor || '#000000',
          fill: shapeData.fillColor || 'transparent',
          strokeWidth: shapeData.strokeWidth || 2,
          closed: shapeData.type === 'Triangle',
          shapeType: type
        });
      case 'Rect':
      case 'Square':
        return new Konva.Rect({
          x: shapeData.x || 0,
          y: shapeData.y || 0,
          width: shapeData.width || 0,
          height: shapeData.height || 0,
          stroke: shapeData.strokeColor || '#000000',
          fill: shapeData.fillColor || 'transparent',
          strokeWidth: shapeData.strokeWidth || 2,
          shapeType: type
        });
      case 'Ellipse':
      case 'Circle':
        console.log('i try make elips  adskfjlasjdkfjkdaj sfkljdsklfj dslkafj')
        const centerX = shapeData.centerX !== undefined ? shapeData.centerX : (shapeData.x || 0);
        const centerY = shapeData.centerY !== undefined ? shapeData.centerY : (shapeData.y || 0);
        const radiusX = shapeData.radiusX || shapeData.radius || 0;
        const radiusY = shapeData.radiusY || shapeData.radius || 0;

        return new Konva.Ellipse({
          x: centerX,
          y: centerY,
          radiusX: radiusX,
          radiusY: radiusY,
          stroke: shapeData.strokeColor || '#000000',
          fill: shapeData.fillColor || 'transparent',
          strokeWidth: shapeData.strokeWidth || 2,
          shapeType: type
        });
      default:
        console.error('Unknown shape type:', type);
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



}
