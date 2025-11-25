



import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DrawTools } from '../types/enum';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-tool-bar',
   templateUrl: './tool-bar.html',
  styleUrl: './tool-bar.css',
  imports:[CommonModule]
})
export class ToolBar {
  @Input() tool:DrawTools  = DrawTools.Mouse;
  @Output() toolChange=new EventEmitter<DrawTools>();

  setTool(selectedTool:DrawTools){
    this.tool=selectedTool;
    this.toolChange.emit(this.tool);
  }
  protected readonly DrawTools = DrawTools;
 normalTools = [
    { tool: DrawTools.Mouse, icon: 'mouse' },
    { tool: DrawTools.Eraser, icon: 'auto_fix_high' },
    { tool: DrawTools.copy, icon: 'content_copy' },
    { tool: DrawTools.exportJson, icon: 'file_download' },
      { tool: DrawTools.XML, icon: 'file_download' },

    { tool: DrawTools.importJson, icon: 'file_upload' },
    { tool: DrawTools.undo, icon: 'undo' },       
    { tool: DrawTools.redo, icon: 'redo' }, 
  ];

  shapeTools = [
    { tool: DrawTools.Line, icon: 'show_chart' },
    { tool: DrawTools.Rectangle, icon: 'rectangle' },
    { tool: DrawTools.Ellipse, icon: 'trip_origin' },
    { tool: DrawTools.Triangle, icon: 'change_history' },
    { tool: DrawTools.circle, icon: 'radio_button_unchecked' },
    { tool: DrawTools.square, icon: 'crop_square' },
  ];

}
