package com.example.Painting.Service;

import com.example.Painting.CommandPattern.Command;
import com.example.Painting.CommandPattern.Redo;
import com.example.Painting.CommandPattern.Response;
import com.example.Painting.CommandPattern.Undo;
import com.example.Painting.Dto.ShapeDto;
import com.example.Painting.Entities.*;
import com.example.Painting.Factory.FactoryOfShapes;
import com.example.Painting.Repository.CommandRepository;
import com.example.Painting.Repository.ShapeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Stack;

@Service
public class ShapeService {
   static public Long counter=0L;
static  public Stack<Command> undoCommands=new Stack<>();
    static  public Stack<Command> redoCommands=new Stack<>();



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
        ++counter;
        Shape shape_created= FactoryOfShapes.createShape(dto);
shape_created.setId(counter);
      shape_created=  shapeRepository.save(shape_created);
        Command command;
        try {
         command=
                   Command.builder().type("CREATE_SHAPE").
                    oldState(null).
                    newState(objectMapper.writeValueAsString(shape_created)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}

//        commandRepository.save(command);
        undoCommands.push(command);
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
//        commandRepository.save(command);
        undoCommands.push(command);

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
//        commandRepository.save(command);
        undoCommands.push(command);

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
//        commandRepository.save(command);
        undoCommands.push(command);

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
//        commandRepository.save(command);
        undoCommands.push(command);

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
            ((Square) shape).setWidth(dto.getWidth());
            ((Square) shape).setHeight(dto.getHeight());
            ((Square) shape).setX(dto.getX());
            ((Square) shape).setY(dto.getY());
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
            ((Circle) shape).setRadiusX(dto.getRadiusX());
            ((Circle) shape).setRadiusY(dto.getRadiusY());

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

//commandRepository.save(command);
        undoCommands.push(command);

        shapeRepository.save(newState);

        return newState;
    }


//    the rest copy and delete and undo and redo and import and export
    public  Shape copy(ShapeDto dto){
        ++counter;
        Shape shape=shapeRepository.findById(dto.getId()).orElse(null);
        Shape oldState=shape;
        Shape clonedShape =shape.clone2();
        clonedShape.setId(null);

           if(dto.getType().equals("Triangle")){
            ((Triangle)clonedShape).setPoints(dto.getPoints());

        }
clonedShape.setId(counter);
        clonedShape=shapeRepository.save(clonedShape);

Command command;

        try {
            command=
                    Command.builder().type("COPY").
                            oldState(objectMapper.writeValueAsString(oldState)).
                            newState(objectMapper.writeValueAsString(clonedShape)).undo(false).build();

        }catch (Exception e){ throw  new RuntimeException("can not mapper");}
//        commandRepository.save(command);
        undoCommands.push(command);

        return clonedShape;


    }
    public  void  clear(){
        this.counter=0L;
        shapeRepository.deleteAll();
        commandRepository.deleteAll();
        undoCommands.clear();;
        redoCommands.clear();
    }

public  void delete(Long id){
//        --counter;
    Command command;
    Shape oldstate=shapeRepository.findById(id).orElse(null);

    try {
        command=
                Command.builder().type("DELETE_SHAPE").
                        oldState(objectMapper.writeValueAsString(oldstate)).
                        newState(null).undo(false).build();

    }catch (Exception e){ throw  new RuntimeException("can not mapper");}

//    commandRepository.save(command);
    undoCommands.push(command);
        shapeRepository.deleteById(id);
}






public Response undo(){
     Response response =  undo.undo();
    return response;
}



    public Response redo(){
       Response   response =  redo.redo();
        return response;
    }



public ByteArrayResource exportJson() {
    List<Shape> shapes = shapeRepository.findAll();
    String json;
    try {
        json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(shapes);

    } catch (Exception e) {
        throw new RuntimeException("not can convert to jsont not  make the file  ");
    }
    ByteArrayResource resource=new ByteArrayResource(json.getBytes());
    return resource;
}


    public ByteArrayResource exportXml() {
        List<Shape> shapes = shapeRepository.findAll();
        XmlMapper xmlMapper=new XmlMapper();
        String xml;
        try {
            xml = xmlMapper.writerWithDefaultPrettyPrinter().writeValueAsString(shapes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert to XML");
        }

        return new ByteArrayResource(xml.getBytes());
    }



}
