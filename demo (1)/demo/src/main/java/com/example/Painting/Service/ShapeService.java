package com.example.Painting.Service;

import com.example.Painting.CommandPattern.Command;
import com.example.Painting.CommandPattern.OpType;
import com.example.Painting.CommandPattern.Redo;
import com.example.Painting.CommandPattern.Undo;
import com.example.Painting.Dto.ShapeDto;
import com.example.Painting.Entities.*;
import com.example.Painting.Factory.FactoryOfShapes;
import com.example.Painting.Repository.CommandRepository;
import com.example.Painting.Repository.ShapeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShapeService {
    @Autowired
    ShapeRepository shapeRepository;
    @Autowired
    CommandRepository commandRepository;
    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    Undo undo;
    @Autowired
    Redo redo;
//    there is some problems in classes in diffrent package
    public Shape createShape(ShapeDto dto){
        Shape shape_created= FactoryOfShapes.createShape(dto);

      shape_created=  shapeRepository.save(shape_created);
        Command command;
        try {
         command=
                   Command.builder().type("CREATE_SHAPE").
                    oldState(null).
                    newState(objectMapper.writeValueAsString(shape_created)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}

        commandRepository.save(command);
        return shape_created;
    }

    public Shape changeFillColor(String color,Long shapeId){
        Shape shape=shapeRepository.findById(shapeId).orElse(null);
        Shape oldState=shape.clone();
        shape.setFillColor(color);
        Shape newState=shape;
        newState= shapeRepository.save(newState);
         Command command;
         try {
             command=
                     Command.builder().type("CHANGE_FILLCOLOR").
                             oldState(objectMapper.writeValueAsString(oldState)).
                             newState(objectMapper.writeValueAsString(newState)).undo(false).build();

         }catch (Exception e){ throw  new RuntimeException("can not mapper");}
        commandRepository.save(command);

return  newState;

    }


    public Shape changeStrokeColor(String color,Long shapeId){
        Shape shape=shapeRepository.findById(shapeId).orElse(null);
        Shape oldState=shape.clone();
        shape.setStrokeColor(color);
        Shape newState=shape;
        newState = shapeRepository.save(newState);
        Command command;
        try {
            command=
                    Command.builder().type("CHANGE_STROKECOLOR").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(newState)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}
        commandRepository.save(command);

        return  newState;

    }

    public Shape changeStrokeWidth(double width,Long shapeId){
        Shape shape=shapeRepository.findById(shapeId).orElse(null);
        Shape oldState=shape.clone();
        shape.setStrokeWidth(width);
        Shape newState=shape;
        newState= shapeRepository.save(newState);
        Command command;
        try {
            command=
                    Command.builder().type("CHANGE_STROKEWIDTH").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(newState)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}
        commandRepository.save(command);

        return  newState;

    }

    public Shape changeRotation(double angle,Long shapeId){
        Shape shape=shapeRepository.findById(shapeId).orElse(null);
        Shape oldState=shape.clone();
        shape.setRotation(angle);
        Shape newState=shape;
        newState= shapeRepository.save(newState);
        Command command;
        try {
            command=
                    Command.builder().type("ROTATION").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(newState)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}
        commandRepository.save(command);

        return  newState;

    }


    public Shape resizeAndMove(ShapeDto dto){
        Shape shape=shapeRepository.findById(dto.getId()).orElse(null);
        Shape oldState=shape.clone();
        Shape newState =shape;
//        newState.setStrokeColor("black");
        if(dto.getType().equals("Rect")){
            ((Rectangle) shape).setWidth(dto.getWidth());
            ((Rectangle) shape).setHeight(dto.getHeight());
            ((Rectangle) shape).setX(dto.getX());
            ((Rectangle) shape).setY(dto.getY());
            newState =shape;

        }
        else  if(dto.getType().equals("Square")){
            ((Rectangle) shape).setWidth(dto.getWidth());
            ((Rectangle) shape).setHeight(dto.getHeight());
            ((Rectangle) shape).setX(dto.getX());
            ((Rectangle) shape).setY(dto.getY());
newState =shape;

        }

        else if( dto.getType().equals("Ellipse")){
            ((Ellipse) shape).setRadiusX(dto.getRadiusX());
            ((Ellipse) shape).setRadiusY(dto.getRadiusY());
            ((Ellipse) shape).setCenterX(dto.getCenterX());
            ((Ellipse) shape).setCenterY(dto.getCenterY());
            newState =shape;

        }
        else if(dto.getType().equals("Circle")){
            ((Circle) shape).setRadius(dto.getRadius());
            ((Circle) shape).setCenterX(dto.getCenterX());
            ((Circle) shape).setCenterY(dto.getCenterY());
            newState =shape;

        }


        else if(dto.getType().equals("Line")){
            ((Line)shape).setPoints(dto.getPoints());
            newState =shape;


        }
        else  if(dto.getType().equals("Triangle")){
            ((Triangle)shape).setPoints(dto.getPoints());
            newState =shape;

        }
        Command command;
        try {
            command=
                    Command.builder().type("MOVE").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(newState)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}

commandRepository.save(command);
        shapeRepository.save(newState);

        return newState;
    }


//    the rest copy and delete and undo and redo and import and export
    public  Shape copy(ShapeDto dto){
        Shape shape=shapeRepository.findById(dto.getId()).orElse(null);
        Shape oldState=shape;
        Shape clonedShape =shape.clone2();
        clonedShape.setId(null);

           if(dto.getType().equals("Triangle")){
            ((Triangle)clonedShape).setPoints(dto.getPoints());

        }

        clonedShape=shapeRepository.save(clonedShape);

Command command;

        try {
            command=
                    Command.builder().type("COPY").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(clonedShape)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}
        commandRepository.save(command);

        return clonedShape;


    }

public  void delete(Long id){
    Command command;
    Shape oldstate=shapeRepository.findById(id).orElse(null);

    try {
        command=
                Command.builder().type("DELETE_SHAPE").
                        oldState(objectMapper.writeValueAsString(oldstate)).
                        newState(null).undo(false).build();

    }catch (Exception e){ throw  new RuntimeException("can not mapper");}

        shapeRepository.deleteById(id);
}






public Pair<Shape,String> undo(){
     Pair <Shape,String>  p =  undo.undo();
    return p;
}



    public Pair<Shape,String> redo(){
        Pair <Shape,String>  p =  redo.redo();
        return p;
    }



public ByteArrayResource exportJson() {
    List<Shape> shapes = shapeRepository.findAll();
    String json;
    try {
        json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(shapes);

    } catch (Exception e) {
        throw new RuntimeException("no ");
    }
    ByteArrayResource resource=new ByteArrayResource(json.getBytes());
    return resource;
}




}
