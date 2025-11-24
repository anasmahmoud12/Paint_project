package com.example.Painting.Controller;

import com.example.Painting.Dto.ShapeDto;
import com.example.Painting.Entities.Shape;
import com.example.Painting.Service.ShapeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
//@RequestMapping("/shape/")
@RequestMapping("/shape/")
@CrossOrigin("http://localhost:4200")
public class ShapeController {
    @Autowired
    ShapeService shapeService;


    @PostMapping("/create")
    public Shape createShape(@RequestBody ShapeDto dto) {
        return   shapeService.createShape(dto);
    }

    @PostMapping("/changeFillColor")
    public Shape changeFillColor(@RequestBody ShapeDto dto){
     return    shapeService.changeFillColor(dto.getFillColor(),dto.getId());
    }

    @PostMapping("/changeStrokeColor")
    public Shape changeStrokeColor(@RequestBody ShapeDto dto){
        return shapeService.changeStrokeColor(dto.getStrokeColor(), dto.getId());
    }

    @PostMapping("/changeStrokeWidth")
    public Shape changeStrokeWidth( @RequestBody ShapeDto dto){
               return shapeService.changeStrokeWidth(dto.getWidth(),dto.getId());
            }

//@PostMapping("/changeRotation")
//    public Shape changeRotation( dt){
//        return shapeService.changeRotation(angle,shapeId);
//    }

    @PostMapping("/resizeAndMove")
    public Shape resizeAndMove(@RequestBody  ShapeDto dto){
    return shapeService.resizeAndMove(dto);

    }


    @PostMapping("/copy")
    public  Shape copy( @RequestBody  ShapeDto dto ){
        return shapeService.copy(dto);
    }

    @PostMapping("/delete/{id}")
    public  void delete( @PathVariable Long id ){
         shapeService.delete(id);
    }

    @GetMapping("/undo")
    public Pair<Shape,String> undo(){
        return shapeService.undo();
    }

    @GetMapping("/redo")
    public Pair<Shape,String> redo(){
            return shapeService.redo();
    }

    @GetMapping("/exportJson")
    public ResponseEntity<Resource> exportJson(){
        ByteArrayResource resource = shapeService.exportJson();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=shapes.json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);


    }


    









}
