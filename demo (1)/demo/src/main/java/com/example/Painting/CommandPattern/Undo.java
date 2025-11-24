package com.example.Painting.CommandPattern;

import com.example.Painting.Entities.Rectangle;
import com.example.Painting.Entities.Shape;
import com.example.Painting.Repository.CommandRepository;
import com.example.Painting.Repository.ShapeRepository;
import com.example.Painting.Service.ShapeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

@Service
public class Undo {
    @Autowired
    CommandRepository commandRepository;
    @Autowired
    ShapeRepository shapeRepository;
    @Autowired
    ObjectMapper objectMapper;

    public Response undo(){

Command command=commandRepository.findTopByUndoFalseOrderByIdDesc().orElse(null);

if(command==null){
//    throw  new RuntimeException("no further undo");
    Response response=new Response(null,"nothing to undo");
    return  response;
//    Pair<Shape, String> p = Pair.of(new Rectangle(),"nothing to undo");
//return  p;
}
command.setUndo(true);
commandRepository.save(command);

        Shape oldState = null;
        Shape newState = null;

        try {
            if (command.getOldState() != null) {
//                System.out.println("yes");
                oldState = objectMapper.readValue(command.getOldState(), Shape.class);
            }
            if (command.getNewState() != null) {
//                System.out.println("no");

                newState = objectMapper.readValue(command.getNewState(), Shape.class);
            }
        } catch (Exception e) {

            throw new RuntimeException("Cannot map JSON to Shape");
        }



        if (     command.getType().equals("CHANGE_STROKECOLOR")
        ||command.getType().equals("CHANGE_FILLCOLOR")
        ||command.getType().equals("ROTATION")
        ||command.getType().equals("MOVE")
        ||command.getType().equals("CHANGE_STROKEWIDTH")     ) {


shapeRepository.save(oldState);
Response response=new Response(oldState,"changeTo");
return response;

}





else if(command.getType().equals("CREATE_SHAPE")||command.getType().equals("COPY")){
           -- ShapeService.counter;
    shapeRepository.deleteById(newState.getId());
    Response response=new Response(newState,"delete");
    return response;



}





else  if(command.getType().equals("DELETE_SHAPE")){
            ++ShapeService.counter;
    oldState.setId(ShapeService.counter);
    shapeRepository.save(oldState);

    Response response=new Response(oldState,"create");
    return  response;

}







else {
    throw new RuntimeException("not have this operation ");
}











    }
}
